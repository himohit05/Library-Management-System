import { useEffect, useState } from "react";

type Book = {
  id: number;
  title: string;
  author: string;
  cover: string;
  available: number;
  category: string;
  language: string;
};

type Props = {
  id: number;
  goBack: () => void;
};

function Book_Details({ id, goBack }: Props) {
  const [book, setBook] = useState<Book | null>(null);
  const [isHeld, setIsHeld] = useState(false);

  const userid = localStorage.getItem("userid");

  useEffect(() => {
    fetch(`http://localhost:5000/book/${id}`)
      .then((res) => res.json())
      .then((data) => setBook(data))
      .catch((err) => console.error(err));

    if (userid) {
      fetch(`http://localhost:5000/hold/${id}/${userid}`)
        .then((res) => res.json())
        .then((data) => setIsHeld(data.isHeld))
        .catch((err) => console.error(err));
    }
  }, [id, userid]);

  if (!book) return <p className="p-6">Loading...</p>;

  const handleHold = async () => {
    if (!userid) {
      alert("User not found");
      return;
    }

    try {
      const url = isHeld ? "http://localhost:5000/unhold" : "http://localhost:5000/hold";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookid: id, userid }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsHeld(!isHeld);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 w-full flex flex-col items-center">

      {/* BACK BUTTON FIXED */}
      <button
        onClick={goBack}
        className="mb-4 px-3 py-1 bg-gray-300 rounded"
      >
        ←  Back
      </button>

      <img
        src={book.cover}
        alt={book.title}
        className="w-60 h-80 object-cover rounded mb-4"
      />

      <h1 className="text-2xl font-bold">{book.title}</h1>
      <p className="text-gray-600">{book.author}</p>

      <p className="mt-2">Category: {book.category}</p>
      <p>Language: {book.language}</p>
      <p>Book ID: {book.id}</p>

      <p className={`mt-2 font-semibold ${book.available > 0 ? "text-green-600" : "text-red-500"}`}>
        {book.available > 0 ? "Available" : "Not Available"}
      </p>

      <button
        onClick={handleHold}
        className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded"
      >
        {isHeld ? "Unhold Book" : "Hold Book"}
      </button>
    </div>
  );
}

export default Book_Details;