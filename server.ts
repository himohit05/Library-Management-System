import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler
} from "express";

import mysql from "mysql2/promise";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}


dotenv.config();


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());


// Auth Middleware



export const authMiddleware: RequestHandler = (req, res, next) => {
  console.log("AUTH HEADER:", req.headers.authorization);

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    req.user = decoded;
    next();
  } catch (err: any) {
    console.log("JWT ERROR:", err.message);
    return res.status(403).json({ error: "Invalid token" });
  }
};




//Role middleware:

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
};






// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


// Test route
app.get("/", (req: Request, res: Response) => {
  res.send("Library Management System API Running");
});



// ------------------ Register ------------------
app.post("/register", async (req, res) => {
  const {name, email, password} = req.body;
  const role = req.body.role || "user";
  const hashedPassword = await bcrypt.hash(password, 10);

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields for Register" });
  }

  console.log("DEBUG:", { name, email, password, role });

  try {
    await db.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "user"]
    );
    res.json({ message: "User registered successfully" });
  } catch (err: any) {

     if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "User already exists for this role" });
    }

    console.log(err);
    res.status(500).json({ error: "User registration failed" });
  }
});




// ------------------ Login ------------------
app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Missing fields Login Error" });
  }

  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT * FROM users WHERE email=? AND role=?",
    [email, role]
  );

  const user = rows[0];
  if (!user) return res.status(400).json({ error: "User not found" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(400).json({ error: "Invalid password" });

  // ✅ NOW fetch permissions (after user exists)
  const [permRows] = await db.execute<RowDataPacket[]>(
    `
    SELECT p.name 
    FROM permissions p
    JOIN user_permissions up 
      ON p.id = up.permission_id
    WHERE up.user_id = ?
    `,
    [user.userid]
  );

  const permissions = permRows.map(p => p.name);

  const token = jwt.sign(
    { id: user.userid, role: user.role, name: user.name },
    process.env.JWT_SECRET as string, 
    { expiresIn: "1h" }
  );

  const responseData = {
    token,
    name: user.name,
    role: user.role,
    userid: user.userid,
    permissions
  };

  console.log("Login response:", responseData);

  res.json(responseData);
});





app.get("/books", async (req, res) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM books");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


// search book with index
app.get("/searchbook", async (req, res) => {
  try {
    const search = (req.query.q as string)?.trim();
    if (!search) return res.json([]);

    const bookId = Number(search);
    const isNumber = !isNaN(bookId);

    const sql = `
      SELECT *
      FROM books
      WHERE
        ${isNumber ? `id = ? OR` : ""}
        title LIKE ? OR
        author LIKE ? OR
        category LIKE ? OR
        language LIKE ?
      ORDER BY id ASC
    `;

    const likeSearch = `%${search}%`;
    const params = isNumber
      ? [bookId, likeSearch, likeSearch, likeSearch, likeSearch]
      : [likeSearch, likeSearch, likeSearch, likeSearch];

    const [rows] = await db.query<RowDataPacket[]>(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/searchbooks", async (req, res) => {

  const { search } = req.body;

  try {

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM books
       WHERE id = ?
       OR title LIKE ?
       OR author LIKE ?`,
      [search, `%${search}%`, `%${search}%`]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }

});





app.get("/import-books", async (req, res) => {
  try {
    // 1️⃣ Fetch books from Open Library
    const response = await fetch("https://openlibrary.org/search.json?q=programming");
    const data = await response.json();

    // 2️⃣ Loop through first 20 books
    for (const book of data.docs.slice(0, 20)) {
      // Some books may not have authors or cover, so we handle that with "Unknown" or placeholder
      const title = book.title;
      const author = book.author_name?.[0] || "Unknown";
      const cover = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : "https://via.placeholder.com/200x300"; // fallback image
      const available = true;

      // 3️⃣ Insert into MySQL
      await db.query(
        "INSERT INTO books (title, author, cover, available) VALUES (?, ?, ?, ?)",
        [title, author, cover, available]
      );
    }

    // 4️⃣ Send response
    res.json({ message: "20 books imported successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to import books" });
  }
});


// ------------------ Get Single Book ------------------
app.get("/book/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows]: any = await db.query(
      "SELECT * FROM books WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(rows[0]); // send single book

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});



// ------------------ Protected Route Example ------------------
const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};



// Example admin-only route
app.get("/admin/books", authenticate, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });
  res.json({ message: "Admin can see all books here" });
});



/*

// Only run once to create first admin
app.get("/admin", async (req, res) => {
  const bcrypt = require("bcryptjs");
  const hashed = await bcrypt.hash("user", 10);

  await db.execute(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["4", "user1", hashed, "user"]
  );

  res.send("First admin created");
});


*/

// issue books
app.post("/issue", async (req, res) => {
  const { bookid, userid } = req.body;
  const useridNum = Number(userid);

  try {
    const [rows]: any = await db.query(
      "SELECT available FROM books WHERE id = ?",
      [bookid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (rows[0].available <= 0) {
      return res.status(400).json({ error: "No copies available" });
    }

    await db.query(
      "UPDATE books SET available = available - 1 WHERE id = ?",
      [bookid]
    );

    const issueDate = new Date().toISOString().split("T")[0];

    await db.query(
      "INSERT INTO issue (bookid, userid, issuedate, status) VALUES (?, ?, ?, ?)",
      [bookid, useridNum, issueDate, "issued"]
    );

    res.json({ message: "Book issued successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/submit", async (req, res) => {
  const { bookid, userid, issuedate } = req.body;

  try {
    // 1️ Increase available quantity
    await db.query(
      "UPDATE books SET available = available + 1 WHERE id = ?",
      [bookid]
    );

    // 2️ Update return date in issue table
    const returndate = new Date().toISOString().split("T")[0];

    await db.query(
      "UPDATE issue SET returndate = ?, status = 'returned' WHERE bookid = ? AND userid = ? AND issuedate = ? AND returndate IS NULL",
      [returndate, bookid, userid, issuedate]
    );

    res.json({ message: "Book submitted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});




app.post("/lostdamaged", async (req, res) => {
  const { status, bookid, userid, issuedate } = req.body;

  try {

    await db.query(
      "UPDATE issue SET  status = ? WHERE bookid = ? AND userid = ? AND issuedate = ? AND returndate IS NULL",
      [status, bookid, userid, issuedate]
    );

    res.json({ message: "Book Reported successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});





    //  Search All Issued Books between selected date  

app.post("/issuedbooks", async (req, res) => {
  const { datefrom, dateto } = req.body;

  try {

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM issue WHERE returndate IS NULL AND issuedate BETWEEN ? AND ?",
      [datefrom, dateto]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database query failed" });
  }
});


// ------------------ HOLD BOOK ------------------
app.post("/hold", async (req, res) => {
  const { bookid, userid } = req.body;
  const useridNum = Number(userid);

  try {
    // 1. Check if already held
    const [existing]: any = await db.query(
      "SELECT * FROM hold WHERE bookid=? AND userid=? AND status='active' AND expirydate > NOW()",
      [bookid, useridNum]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Already held" });
    }

    // 2. Get available copies
    const [bookRows]: any = await db.query(
      "SELECT available FROM books WHERE id=?",
      [bookid]
    );

    if (bookRows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    const available = Number(bookRows[0].available) || 0;

    // 3. Count active holds
    const [holdRows]: any = await db.query(
      "SELECT COUNT(*) as count FROM hold WHERE bookid=? AND status='active' AND expirydate > NOW()",
      [bookid]
    );

    const activeHolds = holdRows[0].count;

    // 4. Apply 50/50 rule
    const maxHolds = Math.max(1, Math.floor(available / 2));

    if (activeHolds >= maxHolds) {
      return res.status(400).json({ error: "Hold limit reached" });
    }

    // 5. Insert hold
    const now = new Date();
    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await db.query(
      "INSERT INTO hold (bookid, userid, holddate, expirydate, status) VALUES (?, ?, ?, ?, 'active')",
      [bookid, useridNum, now, expiry]
    );

    res.json({ message: "Book held successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ------------------ UNHOLD BOOK ------------------
app.post("/unhold", async (req, res) => {
  const { bookid, userid } = req.body;
  const useridNum = Number(userid);

  try {
    await db.query(
      "UPDATE hold SET status='cancelled' WHERE bookid=? AND userid=? AND status='active'",
      [bookid, useridNum]
    );

    res.json({ message: "Hold cancelled" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ------------------ CHECK HOLD ------------------
app.get("/hold/:bookid/:userid", async (req, res) => {
  const { bookid, userid } = req.params;

  try {
    const [rows]: any = await db.query(
      `SELECT * FROM hold 
       WHERE bookid=? AND userid=? 
       AND status='active' 
       AND expirydate > NOW()`,
      [bookid, userid]
    );

    res.json({ isHeld: rows.length > 0 });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



// Reports section


// Inventory Report




// Popular Books by Category
app.get("/api/reports/popular", async (req, res) => {
  try {
    // Popular books
    const [books] = await db.query(`
      SELECT b.title, COUNT(i.id) AS count
      FROM books b
      LEFT JOIN issue i ON b.id = i.bookid
      GROUP BY b.id, b.title
      ORDER BY count DESC
      LIMIT 10
    `);

    // Popular categories
    const [categories] = await db.query(`
      SELECT b.category, COUNT(i.id) AS count
      FROM books b
      LEFT JOIN issue i ON b.id = i.bookid
      GROUP BY b.category
      ORDER BY count DESC
      LIMIT 5
    `);

    // Send a single response
    res.json({ books, categories });
  } catch (err) {
    console.error("Popular report error:", err);
    res.status(500).json({ error: "Failed to fetch popular books" });
  }
});







app.get(
  "/api/reports/all_users",
  authMiddleware,
  authorizeRoles("admin"), // only admin can access
  async (req, res) => {
    try {
      const [rows] = await db.query<RowDataPacket[]>(`
      SELECT  
        u.userid,
        u.name,
        u.email,

        -- total issued
        COUNT(i.id) AS total_issued,

        -- currently issued
        IFNULL(SUM(
            CASE 
                WHEN i.status = 'issued' THEN 1 
                ELSE 0 
            END
        ), 0) AS currently_issued,

        -- overdue count
        IFNULL(SUM(
            CASE 
                WHEN i.status = 'issued' 
                AND DATE_ADD(i.issuedate, INTERVAL 14 DAY) < NOW()
                THEN 1 
                ELSE 0 
            END
        ), 0) AS overdue_count,

        -- fine (₹2 per day after 14 days)
        IFNULL(SUM(
            CASE 
                WHEN i.status = 'issued' 
                AND DATE_ADD(i.issuedate, INTERVAL 14 DAY) < NOW()
                THEN DATEDIFF(
                    NOW(), 
                    DATE_ADD(i.issuedate, INTERVAL 14 DAY)
                ) * 2
                ELSE 0
            END
        ), 0) AS fine,

        -- last issue date
        MAX(i.issuedate) AS last_issue_date

      FROM users u
      LEFT JOIN issue i 
          ON u.userid = i.userid

      GROUP BY 
          u.userid, 
          u.name, 
          u.email

      ORDER BY 
          u.userid;
    `);
      res.json(rows);
    } catch (err) {
      console.error("All Users report error:", err);
      res.status(500).json({ error: "Failed to fetch users report" });
    }
  }
);





app.get("/api/reports/inventory", async (req, res) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        IFNULL((SELECT SUM(available) FROM books), 0) AS available,
        IFNULL((
          SELECT COUNT(*) 
          FROM issue 
          WHERE status = 'issued'
          AND DATE_ADD(issuedate, INTERVAL 14 DAY) >= NOW()
        ), 0) AS issued,



        IFNULL((SELECT COUNT(*) FROM issue WHERE status = 'lost'), 0) AS lost,
        IFNULL((SELECT COUNT(*) FROM issue WHERE status = 'damaged'), 0) AS damaged,
        IFNULL((
          SELECT COUNT(*) 
          FROM issue 
          WHERE status = 'issued'
          AND DATE_ADD(issuedate, INTERVAL 14 DAY) < NOW()
        ), 0) AS overdue
    `);

    res.json(rows[0]);   // ✅ IMPORTANT
  } catch (err) {
    console.error("Inventory error:", err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});


app.get("/api/reports/issued", async (req, res) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        i.bookid,
        i.userid,
        i.issuedate,

        -- derived due date
        DATE_ADD(i.issuedate, INTERVAL 14 DAY) AS due_date,

        i.returndate,
        i.status

      FROM issue i
      ORDER BY i.issuedate DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Issued report error:", err);
    res.status(500).json({ error: "Failed to fetch issued data" });
  }
});

app.get("/api/reports/overdue", async (req, res) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        u.userid,
        u.name,
        i.bookid,
        i.issuedate,

        DATE_ADD(i.issuedate, INTERVAL 14 DAY) AS due_date,

        DATEDIFF(
          NOW(), 
          DATE_ADD(i.issuedate, INTERVAL 14 DAY)
        ) AS days_overdue,

        DATEDIFF(
          NOW(), 
          DATE_ADD(i.issuedate, INTERVAL 14 DAY)
        ) * 2 AS fine

      FROM issue i
      JOIN users u ON i.userid = u.userid

      WHERE 
        i.status = 'issued'
        AND DATE_ADD(i.issuedate, INTERVAL 14 DAY) < NOW()

      ORDER BY days_overdue DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Overdue report error:", err);
    res.status(500).json({ error: "Failed to fetch overdue data" });
  }
});



app.get("/api/reports/students", async (req, res) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        u.userid,
        u.name,
        u.email,

        IFNULL(COUNT(i.id), 0) AS total_issued,

        IFNULL(SUM(CASE WHEN i.status = 'issued' THEN 1 ELSE 0 END), 0) AS currently_issued,

        IFNULL(SUM(CASE WHEN i.status = 'returned' THEN 1 ELSE 0 END), 0) AS returned,

        IFNULL(SUM(
          CASE 
            WHEN i.status = 'issued' 
            AND DATE_ADD(i.issuedate, INTERVAL 14 DAY) < NOW()
            THEN 1 ELSE 0 
          END
        ), 0) AS overdue_count,

        IFNULL(SUM(
          CASE 
            WHEN i.status = 'issued' 
            AND DATE_ADD(i.issuedate, INTERVAL 14 DAY) < NOW()
            THEN DATEDIFF(NOW(), DATE_ADD(i.issuedate, INTERVAL 14 DAY)) * 2
            ELSE 0
          END
        ), 0) AS fine

      FROM users u
      LEFT JOIN issue i ON u.userid = i.userid

      GROUP BY u.userid, u.name, u.email
    `) as any[];

    // 🔥 Top 5 Readers
    const topReaders = [...rows]
      .sort((a: any, b: any) => b.total_issued - a.total_issued)
      .slice(0, 5);

    // 🔥 Top 5 Overdue
    const topOverdue = [...rows]
      .sort((a: any, b: any) => b.overdue_count - a.overdue_count)
      .slice(0, 5); 

    // 🔥 Top 5 Fine
    const topFine = [...rows]
      .sort((a: any, b: any) => (b.fine || 0) - (a.fine || 0))
      .slice(0, 5);

    // 🔥 Most Reliable (high issued, low overdue)
    const mostReliable = [...rows]
      .sort((a: any, b: any) => {
        const scoreA = (a.total_issued || 0) - (a.overdue_count || 0);
        const scoreB = b.total_issued - b.overdue_count;
        return scoreB - scoreA;
      })
      .slice(0, 5);

    res.json({
      users: rows,
      topReaders,
      topOverdue,
      topFine,
      mostReliable,
    });

  } catch (err) {
    console.error("Students report error:", err);
    res.status(500).json({ error: "Failed to fetch students data" });
  }
}); 




app.post("/addbook", async (req, res) => {
  let { id, title, author, cover, available, category, language } = req.body;

  // Validation
  if (!title || !author || !cover || !available || !category || !language) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Convert available to number
  available = parseInt(available, 10);
  if (isNaN(available)) {
    return res.status(400).json({ error: "Available must be a number" });
  }

  try {
    let query, params;

    if (id) {
      // Insert with custom ID
      query = `INSERT INTO books (id, title, author, cover, available, category, language)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
      params = [id, title, author, cover, available, category, language];
    } else {
      // Let MySQL auto-generate ID
      query = `INSERT INTO books (title, author, cover, available, category, language)
               VALUES (?, ?, ?, ?, ?, ?)`;
      params = [title, author, cover, available, category, language];
    }

    const [result] = await db.query<ResultSetHeader>(
      query,
      params
    );

    res.status(201).json({
      message: "Book added successfully",
      bookId: result.insertId || id,
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Database error: " + error.message });
  }
});




app.post("/removebook", async (req, res) => {
  let { bookId, quantity } = req.body;

  // Validation
  if (!bookId || !quantity) {
    return res.status(400).json({ error: "bookId and quantity are required" });
  }

  quantity = parseInt(quantity, 10);
  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "Quantity must be a positive number" });
  }

  try {
    // Get current available quantity
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT available FROM books WHERE id = ?",
      [bookId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    const currentQty = rows[0].available;

    if (quantity > currentQty) {
      return res.status(400).json({ error: "Not enough stock to remove" });
    }

    // Update quantity
    const newQty = currentQty - quantity;
    await db.query(
      "UPDATE books SET available = ? WHERE id = ?",
      [newQty, bookId]
    );

    res.json({
      message: `Successfully removed ${quantity} copy(s)`,
      newQuantity: newQty,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});




app.get("/getbook/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM books WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: `No book found with ID ${id}` });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});


app.post("/removebook", async (req, res) => {
  let { bookId, quantity } = req.body;

  if (!bookId || !quantity) {
    return res.status(400).json({ error: "bookId and quantity are required" });
  }

  quantity = parseInt(quantity, 10);
  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "Quantity must be a positive number" });
  }

  try {
    const [rows] = await db.query<RowDataPacket[]>("SELECT available FROM books WHERE id = ?", [bookId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    const currentQty = rows[0].available;

    if (quantity > currentQty) {
      return res.status(400).json({ error: "Not enough stock to remove" });
    }

    const newQty = currentQty - quantity;
    await db.query("UPDATE books SET available = ? WHERE id = ?", [newQty, bookId]);

    res.json({
      message: `Successfully removed ${quantity} copy(s)`,
      newQuantity: newQty,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});



app.get("/api/user/status", authMiddleware, async (req, res) => {
  const userId = req.user.id; // or userid depending on Step 2 fix

  const [total] = await db.query<RowDataPacket[]>(
    "SELECT COUNT(*) as total FROM issue WHERE userid = ?",
    [userId]
  );

  const [active] = await db.query<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM issue WHERE userid = ? AND status = 'issued'",
    [userId]
  );

  const [returned] = await db.query<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM issue WHERE userid = ? AND status = 'returned'",
    [userId]
  );

  const [overdue] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM issue 
     WHERE userid = ? AND status = 'issued' 
     AND issuedate < DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
    [userId]
  );

const [current] = await db.query(
  `SELECT 
     i.bookid,
     b.title as BookTitle,
     i.issuedate,
     DATE_ADD(i.issuedate, INTERVAL 7 DAY) as due_date
   FROM issue i
   JOIN books b ON i.bookid = b.id
   WHERE i.userid = ? AND i.status = 'issued'`,
  [userId]
);

const [history] = await db.query(
  `SELECT 
     i.bookid,
     b.title as BookTitle,
     i.status,
     i.issuedate as date
   FROM issue i
   JOIN books b ON i.bookid = b.id
   WHERE i.userid = ?
   ORDER BY i.issuedate DESC`,
  [userId]
);

  res.json({
    totalIssued: total[0].total,
    active: active[0].count,
    returned: returned[0].count,
    overdue: overdue[0].count,
    totalFine: overdue[0].count * 10,
    current,
    history,
  });
  console.log(res.json)
});



// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
  
});
