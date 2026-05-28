interface SidebarProps {
  setPage: (page: string) => void;
  role: string;
  permissions: string[];
}

function Sidebar({ setPage, role, permissions }: SidebarProps) {

  console.log("? Sidebar render");
  console.log("role:", role);
  console.log("permissions:", permissions);

  const safePermissions = permissions || [];

  return (
    <nav className="sidebar">
      <h2 className="text-lg font-bold mb-4 text-blue-200">
        Library Management System (LMS)
      </h2>

      <ul className="space-y-2">

        {/* ADMIN ITEMS */}
        {safePermissions.includes("admin_permission") && (
          <li
            className="block px-3 py-2 hover:bg-gray-600 rounded cursor-pointer text-white"
            onClick={() => setPage("Registeruser")}
          >
            Register New User
          </li>
        )}

        {safePermissions.includes("admin_permission") && (
          <li
            className="block px-3 py-2 hover:bg-gray-600 rounded cursor-pointer text-white"
            onClick={() => setPage("Add_Book")}
          >
            Add New Books
          </li>
        )}

        {safePermissions.includes("admin_permission") && (
          <li
            className="block px-3 py-2 hover:bg-gray-600 rounded cursor-pointer text-white"
            onClick={() => setPage("Remove_Book")}
          >
            Remove Existing Book
          </li>
        )}

        {safePermissions.includes("admin_permission") && (
          <li
            className="block px-3 py-2 hover:bg-gray-600 rounded cursor-pointer text-white"
            onClick={() => setPage("Issue")}
          >
            Issue Book
          </li>
        )}

        {safePermissions.includes("admin_permission") && (
          <li
            className="block px-3 py-2 hover:bg-gray-600 rounded cursor-pointer text-white"
            onClick={() => setPage("Submit")}
          >
            Submit Book
          </li>
        )}

        {safePermissions.includes("admin_permission") && (
          <li
            className="block px-3 py-2 hover:bg-gray-600 rounded cursor-pointer text-white"
            onClick={() => setPage("Lost_Damaged")}
          >
            Report Book
          </li>
        )}

        {safePermissions.includes("admin_permission") && (
          <li
            className="block px-3 py-2 hover:bg-gray-600 rounded cursor-pointer text-white"
            onClick={() => setPage("All_Users")}
          >
            View All Users
          </li>
        )}

        {safePermissions.includes("admin_permission") && (
          <li
            className="block px-3 py-2 hover:bg-gray-600 rounded cursor-pointer text-white"
            onClick={() => setPage("Report")}
          >
            Reports
          </li>
        )}

        {/* USER ITEMS */}
        {safePermissions.includes("user_permission") && (
          <li
            className="block px-3 py-2 hover:bg-gray-600 rounded cursor-pointer text-white"
            onClick={() => setPage("Books")}
          >
            Dashboard
          </li>
        )}

        {safePermissions.includes("user_permission") && (
          <li
            className="block px-3 py-2 hover:bg-gray-600 rounded cursor-pointer text-white"
            onClick={() => setPage("User_Status")}
          >
            Status
          </li>
        )}

      </ul>
    </nav>
  );
}

export default Sidebar;