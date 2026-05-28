function Help() {
  return (
    <div className="home-container p-6 text-gray-100 bg-[#717882] min-h-screen">

      <h1 className="text-4xl font-bold mb-4 text-white">
        Help & Support
      </h1>

      <p className="mb-6 text-gray-200 max-w-3xl">
        Welcome to the Library Management System help section. Here you can find
        guidance on how to use different features of the system.
      </p>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-[#5f6670] p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">🔐 Login Issues</h2>
          <p>If you cannot log in, check your email and password or contact admin.</p>
        </div>

        <div className="bg-[#5f6670] p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">🔍 Searching Books</h2>
          <p>Use the search bar to find books by title, author, or category.</p>
        </div>

        <div className="bg-[#5f6670] p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">📖 Issue Books</h2>
          <p>Select a book and click issue to borrow it.</p>
        </div>

        <div className="bg-[#5f6670] p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">↩️ Return Books</h2>
          <p>Return books before the due date to avoid penalties.</p>
        </div>

      </div>

      <div className="mt-10 border-t pt-4 text-sm text-gray-300">
        <p>Need more help? Contact your administrator.</p>
      </div>

    </div>
  );
}

export default Help;