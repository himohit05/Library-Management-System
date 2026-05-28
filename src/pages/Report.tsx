import { useState, useEffect } from "react";
import "../styles/Report.css";
import axios from "axios";
import {
  Book,
  RefreshCcw,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type ReportType =
  | "inventory"
  | "issued"
  | "overdue"
  | "students"
  | "popular";

interface Props {
  goBack: () => void;
  token: string;
}

export default function Report({ goBack, token }: Props) {
  const [activeReport, setActiveReport] = useState<ReportType>("inventory");
  const [loading, setLoading] = useState(false);

  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [data, setData] = useState<any>(null);

  const [sortConfig, setSortConfig] = useState({
    key: "userid",
    order: "asc" as "asc" | "desc",
  });

  //////////////////////////////////////////////////////
  // 🔗 FETCH DATA
  useEffect(() => {
    fetchData();
  }, [activeReport, dateRange]);

  const fetchData = async () => {
    try {
      // Popular tab fetches its own API
      setLoading(true);
       
      let url =
        activeReport === "popular"
          ? "http://localhost:5000/api/reports/popular"
          : `http://localhost:5000/api/reports/${activeReport}?from=${dateRange.from}&to=${dateRange.to}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(res.data);
    } 
    
    catch (err) {
      console.error("Error fetching report:", err);
      setData(null);
    }

    finally {
      setLoading(false);   // ✅ ADD HERE
    }
  };


  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      order:
        prev.key === key
          ? prev.order === "asc"
            ? "desc"
            : "asc"
          : "asc",
    }));
  };

  //////////////////////////////////////////////////////
  const tabs = [
    { key: "inventory", label: "Inventory", icon: <Book size={18} /> },
    { key: "issued", label: "Issued", icon: <RefreshCcw size={18} /> },
    { key: "overdue", label: "Overdue", icon: <Clock size={18} /> },
    { key: "students", label: "Students", icon: <Users size={18} /> },
    { key: "popular", label: "Popular", icon: <TrendingUp size={18} /> },
  ];

  return (
    <div className="report-container">
      <button
        onClick={goBack}
        className="bg-blue-400 text-white px-4 py-2 rounded mb-4"
      >
        ⬅ Back to Dashboard
      </button>

      <h1 className="report-title">Library Reports</h1>

      {/* 📅 Date Filter */}
      <div className="filter-box">
        <input
          type="date"
          onChange={(e) =>
            setDateRange({ ...dateRange, from: e.target.value })
          }
        />
        <input
          type="date"
          onChange={(e) =>
            setDateRange({ ...dateRange, to: e.target.value })
          }
        />
      </div>

      {/* Tabs */}
      <div className="report-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeReport === tab.key ? "active" : ""}
            onClick={() => setActiveReport(tab.key as ReportType)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="report-content">
        {loading && <div className="loading">Loading...</div>}
       {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <ReportContent
            type={activeReport}
            data={data}
            sortConfig={sortConfig}
            handleSort={handleSort}
          />
        )}
        
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////
// 📊 Dynamic Content
function ReportContent({ type, data}: any) {

  const truncate = (text: string, max = 25) => {
    if (!text) return "";
    return text.length > max ? text.slice(0, max) + "..." : text;
  };

  switch (type) {

    case "inventory":
      if (!data) return <div>No data available</div>;
      console.log("Inventory Data:", data);
      return (
        <>
          <h2>Inventory Report</h2>
<div className="pie-container">
  <Pie
    data={{
      labels: ["Available", "Issued", "Overdue", "Lost", "Damaged"],
      datasets: [
        {
          data: [
            data?.available ?? 0,
            data?.issued ?? 0,
            data?.overdue ?? 0,
            data?.lost ?? 0,
            data?.damaged ?? 0
          ],
          backgroundColor: [
            "#00FF00",
            "#0000FF",
            "#FFFF00",
            "#000000",
            "#FF0000"
          ]
        },
      ],
    }}
    options={{
      maintainAspectRatio: false,  // 👈 IMPORTANT
      plugins: {
        legend: {
          position: "top",
          labels: {
            boxWidth: 15,
            padding: 20
          }
        }
      }
    }}
  />
</div>

        </>
      );
case "issued":

  if (!data) return <div>No data available</div>;

  return (
    <>
      <h2>Issued Books</h2>

      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Book ID</th>
              <th>User ID</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Return Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(data) && data.length > 0 ? (
              data.map((row: any, index: number) => (
                <tr key={index}>
                  <td>{row.bookid}</td>
                  <td>{row.userid}</td>

                  <td>
                    {row.issuedate
                      ? new Date(row.issuedate).toLocaleDateString()
                      : "—"}
                  </td>

                  <td>
                    {row.due_date
                      ? new Date(row.due_date).toLocaleDateString()
                      : "—"}
                  </td>

                  <td>
                    {row.returndate
                      ? new Date(row.returndate).toLocaleDateString()
                      : "—"}
                  </td>

                  <td>
                    <span className={`status ${row.status}`}>
                      {row.status || "—"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="no-data">
                  No issued records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

case "overdue":
  if (!data || !Array.isArray(data)) {
    return <div>No overdue records</div>;
  }

  return (
    <>
      <h2>Overdue Books</h2>

      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Book ID</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Days Overdue</th>
              <th>Fine (₹)</th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((row: any, index: number) => (
                <tr key={index}>
                  <td>{row.userid}</td>
                  <td>{row.name}</td>
                  <td>{row.bookid}</td>

                  <td>
                    {new Date(row.issuedate).toLocaleDateString()}
                  </td>

                  <td>
                    {new Date(row.due_date).toLocaleDateString()}
                  </td>

                  <td>
                    <span className="badge warning">
                      {row.days_overdue} days
                    </span>
                  </td>

                  <td>
                    <span className="badge danger">
                      ₹{row.fine}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-data">
                  No overdue books
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );


    case "popular": {
      if (!data || !data.books)
        return <div className="loading">Loading report...</div>;

      const labels = data.books.map((b: any) => truncate(b.title, 25));
      const counts = data.books.map((b: any) => b.count);

      return (
        <>
          <h2>Books</h2>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: "Times Issued",
                  data: counts,
                  backgroundColor: "#0000FF",
                },
              ],
            }}
            options={{
               indexAxis: "y",   // 🔥 THIS LINE flips the chart
              responsive: true,
              plugins: {
                legend: { display: false },
                title: {
                  display: true,
                  text: "Top 10 Most Issued Books",
                },
              },
            }}
          />




        {data.categories && (
          <div style={{ marginTop: "40px" }}>
            <h3>Categories</h3>
            <Bar
              data={{
                labels: data.categories.map((c: any) => c.category),
                datasets: [
                  {
                    label: "Books Issued",
                    data: data.categories.map((c: any) => c.count),
                    backgroundColor: "#0000FF",
                  },
                ],
              }}
              options={{
                indexAxis: "y",
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: {
                    display: true,
                    text: "Top 5 Most Issued Book Categories",
                  },
                },
              }}
            />
          </div>
        )}

        </>
      );
    }

case "students":
  if (!data) return <div>No data available</div>;

  return (
    <>
      <h2>Students Report</h2>

      <div className="students-grid">

        <div className="student-card">
          <h3>Top Readers</h3>
          <ol>
            {data.topReaders?.map((u: any, i: number) => (
              <li key={i}>
                <span>{u.name}</span>
                <span>{u.total_issued}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="student-card">
          <h3>Top Overdue</h3>
          <ol>
            {data.topOverdue?.map((u: any, i: number) => (
              <li key={i}>
                <span>{u.name}</span>
                <span>{u.overdue_count}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="student-card">
          <h3>Top Fine</h3>
          <ol>
            {data.topFine?.map((u: any, i: number) => (
              <li key={i}>
                <span>{u.name}</span>
                <span>₹{u.fine}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="student-card">
          <h3>Most Reliable</h3>
          <ol>
            {data.mostReliable?.map((u: any, i: number) => (
              <li key={i}>
                <span>{u.name}</span>
                <span>{u.total_issued - u.overdue_count}</span>
              </li>
            ))}
          </ol>
        </div>

      </div>
    </>
  );

    default:
      return null;
  }
}
