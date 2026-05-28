function About() {
  return (
    <div className="home-container p-6 text-gray-100 bg-[#717882] min-h-screen">

      {/* Header */}
      <h1 className="text-4xl font-bold mb-4 text-white">
        About Library Management System
      </h1>

      <p className="flex flex-col text-gray-200 mb-6 max-w-3xl">
        The Library Management System (LMS) is a modern web-based application
        designed to simplify and automate the management of library operations.
        It helps administrators efficiently handle books, users, and transactions
        in a structured and user-friendly way.
      </p>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">

        <div className="bg-[#5f6670] p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2 text-white">📚 Book Management</h2>
          <p className="text-gray-300">
            Add, update, search, and manage books with ease. Track availability
            and organize books by category, author, and language.
          </p>
        </div>

        <div className="bg-[#5f6670] p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2 text-white">👤 User Management</h2>
          <p className="text-gray-300">
            Register and manage users efficiently. Maintain user records and
            access roles securely.
          </p>
        </div>

        <div className="bg-[#5f6670] p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2 text-white">📖 Issue & Return</h2>
          <p className="text-gray-300">
            Issue books to users and track returns. Maintain accurate records of
            issued books and due dates.
          </p>
        </div>

        <div className="bg-[#5f6670] p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2 text-white">🔍 Smart Search</h2>
          <p className="text-gray-300">
            Quickly find books by title, author, category, or ID using a powerful
            search system.
          </p>
        </div>

      </div>

      {/* Mission Section */}
      <div className="flex flex-col mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-white">🎯 Our Mission</h2>
        <p className="text-gray-200 max-w-3xl">
          Our goal is to digitize and streamline library operations, reducing
          manual effort and improving efficiency. We aim to provide a simple,
          fast, and reliable platform for managing library systems.
        </p>
      </div>

      {/* Footer Note */}
      <div className="mt-10 border-t border-gray-500 pt-4 text-gray-300 text-sm">
        <p>
          © {new Date().getFullYear()} Library Management System. All rights reserved.
        </p>
      </div>

    </div>
  );
}

export default About;