import { useState } from "react";
import Register_User from "../pages/Register_User";
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import Issue from "../pages/Issue";
import Submit from "../pages/Submit";
import Lost_Damaged from "../pages/Lost_Damaged";
import Issued_Books from "../pages/Issued_Books";
import Books from "../pages/Books";
import Add_Book from "../pages/Add_Book";
import Remove_Book from "../pages/Remove_Book";
import Search from "./Search";
import About from "../pages/About";
import Help from "../pages/Help";
import Report from "../pages/Report";
import All_Users from "../pages/All_Users";
import User_Status from "../pages/User_Status";
import Book_Details from "../pages/Book_Details";

type HomeProps = {
  email: string;
  role: string;
  token: string;
  onLogout: () => void;
  user: any;
};

function Dashboard({ email, role, token, onLogout, user }: HomeProps) {


  const permissions = user?.permissions ?? [];

  const [page, setPage] = useState(
  role === "admin" ? "Admin_Dashboard" : "Books"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);

  const clearSearch = () => {
    setSearchQuery("");
    setPage(role === "admin" ? "Admin_Dashboard" : "Books");
  };

  const goBack = () => {
    setPage(role === "admin" ? "Admin_Dashboard" : "Books");
  };


  return (
    <div className="page">

      {/* NAVBAR */}
      <Navbar
        onLogout={onLogout}
        onSearch={(query) => {
          setSearchQuery(query);
          setPage(role === "admin" ? "Search" : "Books");
        }}
        goToAbout={() => setPage("About")}
        goToHelp={() => setPage("Help")}
      />

      <div className="layout">

        {/* SIDEBAR */}
        <div className="w-64 min-w-[250px] bg-gray-800 text-white">
          <Sidebar
            setPage={setPage}
            role={role}
            permissions={permissions}
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0 overflow-auto">

          {page === "All_Users" && <All_Users />}
          {page === "Help" && <Help />}
          {page === "About" && <About />}

          {page !== "Help" && page !== "About" && (
            <div className="home-container">

              {/* USER */}
              {role === "User" && (
                <>
                  <h2 className="text-2xl mb-4 text-center">
                    Welcome, {user?.name}
                  </h2>

                  {page === "Books" && (
                    <Books
                      searchQuery={searchQuery}
                      clearSearch={clearSearch}
                      email={email}
                      onSelectBook={(id) => {
                        setSelectedBookId(id);
                        setPage("details");
                      }}
                    />
                  )}

                  {page === "details" && selectedBookId && (
                    <Book_Details id={selectedBookId}
		     goBack={goBack}
		     />
                  )}

                  {page === "User_Status" && (
                    <User_Status
                      user={user}
                      token={token}
                      goBack={() => setPage("Books")}
                    />
                  )}
                </>					
              )}

              {/* ADMIN */}
              {role === "admin" && (
                <>
                  {page === "Admin_Dashboard" && (
                    <div className="text-center">
                      <h1 className="text-4xl font-bold mb-6">
                        Admin Dashboard
                      </h1>

                      <h2 className="text-2xl mb-2">
                        Welcome, {user?.name}
                      </h2>

                      <button
                        onClick={() => setPage("Registeruser")}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Register New User
                      </button>
                    </div>
                  )}

                  {page === "Registeruser" && (
                    <Register_User
                      token={token}
                      goBack={() => setPage("Admin_Dashboard")}
                    />
                  )}

                  {page === "Issue" && (
                    <Issue token={token} goBack={() => setPage("Admin_Dashboard")} />
                  )}

                  {page === "Submit" && (
                    <Submit token={token} goBack={() => setPage("Admin_Dashboard")} />
                  )}

                  {page === "Lost_Damaged" && (
                    <Lost_Damaged token={token} goBack={() => setPage("Admin_Dashboard")} />
                  )}

                  {page === "Issuedbooks" && (
                    <Issued_Books token={token} goBack={() => setPage("Admin_Dashboard")} />
                  )}

                  {page === "Report" && (
                    <Report token={token} goBack={() => setPage("Admin_Dashboard")} />
                  )}

                  {page === "Add_Book" && (
                    <Add_Book token={token} goBack={() => setPage("Admin_Dashboard")} />
                  )}

                  {page === "Remove_Book" && (
                    <Remove_Book token={token} goBack={() => setPage("Admin_Dashboard")} />
                  )}


{page === "details" && selectedBookId && (
  <Book_Details
    id={selectedBookId}
    goBack={() => setPage("Admin_Dashboard")}
  />
)}






		{page === "Search" && (
		  <Search
		    searchQuery={searchQuery}
		    goBack={() => setPage("Admin_Dashboard")}
		    clearSearch={clearSearch}   // ? ADD
        email={email}
		    onSelectBook={(id) => {     // ? ADD
		      setSelectedBookId(id);
		      setPage("details");
		    }}
		  />
		)}
</>
)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;