import { useState } from "react";
import axios from "axios";

interface Props {
  token: string;
  goBack: () => void;
}

interface Book {
  id: number;
  title: string;
  author: string;
  available: number;
}

export default function Remove_Book({ token, goBack }: Props) {
  const [bookId, setBookId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [bookInfo, setBookInfo] = useState<Book | null>(null);
  const [message, setMessage] = useState("");

  // Step 1: Check book details
  const handleCheckBook = async () => {
    if (!bookId) {
      setMessage("Please enter Book ID to check.");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/getbook/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookInfo(res.data);
      setMessage("");
    } catch (err: any) {
      console.error(err);
      setBookInfo(null);
      setMessage(err.response?.data?.error || "Error fetching book info");
    }
  };

  // Step 2: Confirm and remove book
  const handleRemoveBook = async () => {
    if (!bookInfo) return;
    if (!quantity) {
      setMessage("Please enter quantity to remove.");
      return;
    }

    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setMessage("Quantity must be a positive number");
      return;
    }

    if (qtyNum > bookInfo.available) {
      setMessage(`Cannot remove more than available quantity (${bookInfo.available})`);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/removebook",
        { bookId: bookInfo.id, quantity: qtyNum },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(
        `${res.data.message}. New available quantity: ${res.data.newQuantity}`
      );

      // Reset form
      setBookId("");
      setQuantity("");
      setBookInfo(null);
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.error || "Error removing book");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Remove Books from Library</h2>

      {message && (
        <div className="mb-4 p-2 bg-gray-200 rounded text-center">{message}</div>
      )}

      <input
        type="text"
        placeholder="Book ID"
        className="border p-2 w-full mb-3 rounded"
        value={bookId}
        onChange={(e) => setBookId(e.target.value)}
      />

      <button
        className="bg-yellow-500 text-white px-4 py-2 rounded w-full mb-3"
        onClick={handleCheckBook}
      >
        Check Book
      </button>

      {bookInfo && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <p><strong>Title:</strong> {bookInfo.title}</p>
          <p><strong>Author:</strong> {bookInfo.author}</p>
          <p><strong>Available:</strong> {bookInfo.available}</p>

          <input
            type="text"
            placeholder="Quantity to Remove"
            className="border p-2 w-full mb-3 rounded mt-2"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <button
            className="bg-red-500 text-white px-4 py-2 rounded w-full"
            onClick={handleRemoveBook}
          >
            Confirm Remove
          </button>
        </div>
      )}

      <button
        onClick={goBack}
        className="bg-blue-400 text-white px-4 py-2 rounded w-full mt-3"
      >
        ⬅ Back to Dashboard
      </button>
    </div>
  );
}