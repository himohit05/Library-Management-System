import { useEffect, useState } from "react";

type Book = {
  id: number;
  title: string;
  author: string;
  cover: string;
  available: number;
};

type Props = {
  searchQuery: string;
  onSelectBook: (id: number) => void;
  clearSearch: () => void;
  email: string;
};

function Books({ searchQuery, onSelectBook, clearSearch }: Props) {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const query = searchQuery?.trim();

      const url = query
        ? `http://localhost:5000/searchbook?q=${encodeURIComponent(query)}`
        : "http://localhost:5000/books";

      const res = await fetch(url);
      const data = await res.json();

      setBooks(data);
    };

    fetchBooks();
  }, [searchQuery]);

  const isSearching = searchQuery && searchQuery.trim() !== "";

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Library Books</h1>

      {/* SEARCH HEADER */}
      {isSearching && (
        <div className="flex justify-between items-center mb-4 bg-gray-100 p-2 rounded">
          <p className="text-sm">
            Showing {books.length} results for "<b>{searchQuery}</b>"
          </p>

          <button
            onClick={clearSearch}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* NO RESULTS */}
      {isSearching && books.length === 0 && (
        <p className="text-center text-gray-500">No books found</p>
      )}

      {/* NO BOOKS (GENERAL) */}
      {!isSearching && books.length === 0 && (
        <p className="text-center text-gray-500">No books available</p>
      )}

      {/* BOOK GRID */}
      <div className="grid grid-cols-5 gap-3 p-2 rounded-xl">
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => onSelectBook(book.id)}
            className="border rounded-lg shadow hover:shadow-lg transition p-2 flex flex-col items-center cursor-pointer"
          >
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-32 object-cover rounded-md mb-2"
            />
            <h2 className="text-sm font-semibold text-center">{book.title}</h2>
            <p className="text-gray-600 text-center text-xs">{book.author}</p>
            <p className="text-gray-600 text-center text-xs">{book.id}</p>

            <p
              className={`mt-1 font-semibold text-sm ${
                book.available > 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {book.available > 0 ? "Available" : "Not Available"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Books;