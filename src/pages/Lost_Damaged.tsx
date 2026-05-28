import { useState } from "react";
import axios from "axios";

interface Props {
  token: string;
  goBack: () => void;
}

export default function Lost_Damaged({ token, goBack }: Props) {
  const [bookid, setBookId] = useState("");
  const [userid, setUserId] = useState("");
  const [issuedate, setIssueDate] = useState("");
  const [status, setStatus] = useState("");
  
  const [message, setMessage] = useState("");

  const handleLostdamaged = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/lostdamaged",
        { status,bookid, userid, issuedate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);

      // reset form
      setStatus("");
      setBookId("");
      setUserId("");
      setIssueDate("");
      
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.error || "Error: Book Could Not Reported Try Again");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Report Lost and Damaged Book</h2>

      {message && (
        <div className="mb-4 p-2 bg-gray-200 rounded text-center">
          {message}
        </div>
      )}

      <input
        type="text"
        placeholder="Book ID"
        className="border p-2 w-full mb-3 rounded"
        value={bookid}
        onChange={(e) => setBookId(e.target.value)}
      />

      <input
        type="text"
        placeholder="User ID"
        className="border p-2 w-full mb-3 rounded"
        value={userid}
        onChange={(e) => setUserId(e.target.value)}
      />


      <input
        type="text"
        placeholder="Issue Date (YYYY-MM-DD)"
        className="border p-2 w-full mb-3 rounded"
        value={issuedate}
        onChange={(e) => setIssueDate(e.target.value)}
      />


        <select
        className="border p-2 w-full mb-4"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="lost">Lost</option>
        <option value="damaged">Damaged</option>
      </select>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-3"
        onClick={handleLostdamaged}
      >
        Report
      </button>

      <button
        onClick={goBack}
        className="bg-gray-400 text-white px-4 py-2 rounded w-full"
      >
        Cancel
      </button>
    </div>
  );
}