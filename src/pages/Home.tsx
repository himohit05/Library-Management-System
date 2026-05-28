type HomeProps = {
  name: string;
  role: string;
};

function Home({ name, role }: HomeProps) {
  return (
    <div className="home-container">
      <div className="text-center">

        <h1 className="text-4xl font-bold mb-6">
          Library Management System
        </h1>

        <h2 className="text-2xl mb-2">
          Welcome {name}
        </h2>

        <p className="mb-1">
          Role: {role}
        </p>

        <p>
          This will become the future homepage.
        </p>

      </div>
    </div>
  );
}

export default Home;