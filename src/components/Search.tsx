import Books from "../pages/Books";

type Props = {
  searchQuery: string;
  goBack: () => void;
  clearSearch: () => void;   // ? ADD
  onSelectBook: (id: number) => void; // ? ADD
  email: string;
};

function Search({email, searchQuery, goBack, clearSearch, onSelectBook }: Props) {
  return (
    <div className="home-container flex flex-col items-center gap-4">

      <p className="mb-4 text-gray-600 text-center">
        Showing results for: <strong>{searchQuery}</strong>
      </p>

      {/* ? FIX: pass all props */}
      <Books
        email={email}
        searchQuery={searchQuery}
        clearSearch={clearSearch}
        onSelectBook={onSelectBook}
      />

      <div>
        <button
          onClick={goBack}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          ←  Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Search;