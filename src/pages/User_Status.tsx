import { useEffect, useState } from "react";
import axios from "axios";

function User_Status({ goBack }: any) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    axios
      .get("http://localhost:5000/api/user/status", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) =>
        console.error("API error:", err.response?.data || err.message)
      );
  }, []);

  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">📊 My Status</h2>
          <p className="text-gray-500">Your library activity overview</p>
        </div>

        {/* BACK BUTTON (RESTORED + IMPROVED) */}
        <button
          onClick={goBack}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
        >
          ⬅ Back
        </button>
      </div>

      {/* STATS */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">

        <div className="bg-white p-4 rounded-xl shadow">
          📚 <span className="font-semibold">Total:</span> {data.totalIssued}
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          ⏳ <span className="font-semibold">Active:</span> {data.active}
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          ⚠️ <span className="font-semibold">Overdue:</span> {data.overdue}
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          🔁 <span className="font-semibold">Returned:</span> {data.returned}
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-red-600 font-bold">
          💰 ₹{data.totalFine}
        </div>

      </div>

      {/* CURRENT BOOKS */}
      <div className="max-w-6xl mx-auto mb-8">
        <h3 className="text-xl font-semibold mb-3">📅 Current Books</h3>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">Book</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3">Due Date</th>
              </tr>
            </thead>

            <tbody>
            {data.current?.map((b: any, i: number) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{b.BookTitle}</td>
                <td className="p-3">{b.issuedate}</td>
                <td className="p-3 text-red-600">{b.due_date}</td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HISTORY */}
      <div className="max-w-6xl mx-auto">
        <h3 className="text-xl font-semibold mb-3">📜 History</h3>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">Book</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>

            <tbody>
            {data.history?.map((h: any, i: number) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{h.BookTitle}</td>

                <td className="p-3">
                    <span
                    className={`px-2 py-1 rounded text-sm ${
                        h.status === "returned"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                    >
                    {h.status}
                    </span>
                </td>

                <td className="p-3">{h.date}</td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default User_Status;