import { useState } from "react";
import axios from "axios";

interface Props {
  token: string;
  goBack: () => void;
}

export default function Add_Book({ token, goBack }: Props) {
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [cover, setCover] = useState("");
  const [available, setAvailable] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");
  const [message, setMessage] = useState("");



  const handleAddbook = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/addbook",
        { id, title, author, cover, available, category, language },
        { headers: { Authorization: `Bearer ${token}` } } // send admin JWT
      );
      setMessage(res.data.message);
      // reset form
      setId("");
      setTitle("");
      setAuthor("");
      setCover("");
      setAvailable("");
      setCategory("");
      setLanguage("");
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.error || "Error : Please Try Again");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Book to Liabrary</h2>

      {message && (
        <div className="mb-4 p-2 bg-gray-200 rounded text-center">{message}</div>
      )}

      <input
        type="text"
        placeholder="Book ID"
        className="border p-2 w-full mb-3 rounded"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      <input
        type="text"
        placeholder="Title"
        className="border p-2 w-full mb-3 rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="text"
        placeholder="Author"
        className="border p-2 w-full mb-3 rounded"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />
      <input
        type="text"
        placeholder="Image Path"
        className="border p-2 w-full mb-3 rounded"
        value={cover}
        onChange={(e) => setCover(e.target.value)}
      />
      <input
        type="text"
        placeholder="Qty"
        className="border p-2 w-full mb-3 rounded"
        value={available}
        onChange={(e) => setAvailable(e.target.value)}
      />

     <input
        type="text"
        placeholder="Language"
        className="border p-2 w-full mb-3 rounded"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      />




<select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="border p-2 w-full mb-3 rounded"
>
  <option value="">- Choose Category -</option>
  <option value="Classic">Classic</option>
  <option value="Fiction">Fiction</option>
  <option value="Adventure">Adventure</option>
  <option value="Science">Science</option>
  <option value="Mystery">Mystery</option>
  <option value="Government">Government</option>
  <option value="Religion">Religion</option>
  <option value="Self-Help">Self-Help</option>
</select>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        onClick={handleAddbook}
      >
        Register
      </button>


	<button
	  onClick={goBack}
	  className="bg-blue-400 text-white px-4 py-2 rounded "
	>
	  ⬅ Back to Dashboard
	</button>
    </div>
  );
}