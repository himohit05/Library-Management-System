import { useState } from "react";
import axios from "axios";

interface Props {
  token: string;
  goBack: () => void;
}

export default function Issued_Books({ token, goBack }: Props) {
  const [datefrom, setDateFrom] = useState("");
  const [dateto, setDateTo] = useState("");
  
  const [message, setMessage] = useState("");
  const [books, setBooks] = useState<any[]>([]);

  const handleIssuedBooks = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/issuedbooks",
        { datefrom, dateto },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBooks(res.data); // store returned data
      setMessage(res.data.message);

      // reset form
      setDateFrom("");
      setDateTo("");
      
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.error || "Error: Please Try Again");
    }
  };

  return (
      <div className="flex flex-col items-center">    
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">View Issued Books</h2>

      {message && (
        <div className="mb-4 p-2 bg-gray-200 rounded text-center">
          {message}
        </div>
      )}

      <input
        type="text"
        placeholder="Date From"
        className="border p-2 w-full mb-3 rounded"
        value={datefrom}
        onChange={(e) => setDateFrom(e.target.value)}
      />

      <input
        type="text"
        placeholder="Date To"
        className="border p-2 w-full mb-3 rounded"
        value={dateto}
        onChange={(e) => setDateTo(e.target.value)}
      />


      <button
        className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-3"
        onClick={handleIssuedBooks}
      >
        Show Issued Book
      </button>

      <button
        onClick={goBack}
        className="bg-gray-400 text-white px-4 py-2 rounded w-full"
      >
        Cancel
      </button>
      </div>


	{books.length > 0 && (
  	<div className="max-w-7xl mx-auto mt-6 overflow-x-auto">
    	<table className="min-w-full border border-gray-300">

      	<thead className="bg-gray-100">
        <tr>
          <th className="border px-4 py-2">ID</th>
          <th className="border px-4 py-2">Book ID</th>
          <th className="border px-4 py-2">User ID</th>
          <th className="border px-4 py-2">Issue Date</th>
          <th className="border px-4 py-2">Return Date</th>
          <th className="border px-4 py-2">Status</th>
        </tr>
      </thead>

      <tbody>
        {books.map((book) => (
          <tr key={book.id} className="text-center">
            <td className="border px-4 py-2">{book.id}</td>
            <td className="border px-4 py-2">{book.bookid}</td>
            <td className="border px-4 py-2">{book.userid}</td>
            <td className="border px-4 py-2">{book.issuedate}</td>
            <td className="border px-4 py-2">
              {book.returndate || "Not Returned"}
            </td>
            <td className="border px-4 py-2">
              {book.status || "Issued"}
            </td>
          </tr>
        ))}
      </tbody>

    </table>
  </div>
)}


  </div>

  );
}