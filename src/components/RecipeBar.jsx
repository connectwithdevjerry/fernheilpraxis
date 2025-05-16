import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path to your firebase config

const RecipeBar = ({

  onEditRemedy,
  onPasteRemedy,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [remedies, setRemedies] = useState([]);
  const [selectedRemedy, setSelectedRemedy] = useState(null);

  useEffect(() => {
    const fetchRemedies = async () => {
      try {
        const snapshot = await getDocs(collection(db, "recipes"));
        const fetchedRemedies = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRemedies(fetchedRemedies);
      } catch (error) {
        console.error("Error fetching remedies:", error);
      }
    };

    fetchRemedies();
  }, []);


  const filteredRemedies = remedies.filter((remedy) =>
    remedy.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePaste = () => {
    if (selectedRemedy) {
      const remedyDetails = ` ${selectedRemedy.name}\n ${
        selectedRemedy.source
      }\n ${selectedRemedy.instructions}\n ${
        selectedRemedy.notes || ""
      }`;
      onPasteRemedy(remedyDetails);
    }
  };

  return (
    <div className="p-4 bg-gray-100 shadow-md h-full rounded-md">
      <div className="mb-4 flex flex-wrap gap-2">
        {selectedRemedy && (
          <>
            <button
              onClick={handlePaste}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
            >
              Paste
            </button>
            <button
              onClick={() => onEditRemedy(selectedRemedy)}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Edit
            </button>
          </>
        )}
      </div>

      <input
        type="text"
        placeholder="Search remedies..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      />

      <ul className="space-y-2 overflow-y-auto h-[100vh]">
        {filteredRemedies.map((remedy) => (
          <li
            key={remedy.id}
            className={`p-2 bg-white rounded-md shadow-md hover:bg-blue-100 cursor-pointer flex justify-between items-center ${
              selectedRemedy?.id === remedy.id ? "bg-blue-200" : ""
            }`}
            onClick={() => setSelectedRemedy(remedy)}
          >
            <span>{remedy.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecipeBar;
