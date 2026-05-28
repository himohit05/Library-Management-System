import React from "react";


type Props = {
  onLogout: () => void;
  onSearch: (query: string) => void;
  goToAbout: () => void;
  goToHelp: () => void;
};

function Navbar({ onLogout, onSearch, goToAbout, goToHelp }: Props) {


const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const query = (e.currentTarget.search as HTMLInputElement).value;

  if (!query) {
  onSearch(""); // clears search
  return;
}

onSearch(query);


};

  return (
    <>
      <nav className="Navbar">
        <div className="right-items">
          <ul className="Navul">
            <li className="logo">
              <img src="src/assets/logo.svg" alt="Library Logo" width={100} height={100} />
            </li>
            <li>
  <button
    onClick={goToAbout}
    className="bg-[#2c3e50] text-[#ecf0f1] px-3 py-1 rounded"
  >
    About
  </button>
</li>
          </ul>
        </div>

        <div className="left-items">
          <ul className="Navul">
            <li>
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  name="search"
                  placeholder="🔍 Book, Author, ID, Category, Language"
                  className="search-input"
                />
                <button type="submit" className="search-button">Search</button>
              </form>
            </li>
            <li>
              <button
                onClick={() => goToHelp()}
                className="bg-[#2c3e50] text-[#ecf0f1] px-3 py-1 rounded"
              >
                Help
              </button>
            </li>
            <button
              onClick={onLogout}
              className="bg-[#2c3e50] text-[#ecf0f1] px-3 py-1 rounded"
            >
              Logout
            </button>
          </ul>
        </div>
      </nav>


    </>
  );
}

export default Navbar;