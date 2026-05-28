import { useEffect, useState } from "react";
import axios from "axios";

export default function All_Users() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    axios
      .get("http://localhost:5000/api/reports/all_users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="w-full px-8 py-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Users Report
      </h2>

      {/* Scrollable Container */}
      <div className="shadow-xl rounded-2xl border overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
          <table className="w-full text-base text-left">
            
            {/* Sticky Header */}
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-center">Total</th>
                <th className="px-6 py-4 text-center">Active</th>
                <th className="px-6 py-4">Last Issue</th>
                <th className="px-6 py-4 text-center">Overdue</th>
                <th className="px-6 py-4 text-center">Fine</th>
              </tr>
            </thead>

            <tbody>
              {data.map((u: any, index) => (
                <tr
                  key={u.userid}
                  className={`border-t ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="px-6 py-4 font-medium text-lg">
                    {u.userid}
                  </td>

                  <td className="px-6 py-4 text-lg">{u.name}</td>

                  <td className="px-6 py-4 text-gray-600">
                    {u.email}
                  </td>

                  <td className="px-6 py-4 text-center text-lg">
                    {u.total_issued ?? 0}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                      {u.currently_issued ?? 0}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {u.last_issue_date
                      ? new Date(u.last_issue_date).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        u.overdue_count > 0
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {u.overdue_count ?? 0}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center font-semibold text-lg">
                    ₹{u.fine ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-lg">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}