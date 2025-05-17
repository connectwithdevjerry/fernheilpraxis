import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path to your firebase config
import { useLang } from "../useLang";

const RecipeBar = ({
  onPasteRemedy,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [remedies, setRemedies] = useState([]);
  const [selectedRemedy, setSelectedRemedy] = useState(null);
  const { t } = useLang();

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


  const filteredRemedies = remedies
    .filter((remedy) =>
      remedy.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleSelectRemedy = (remedy) => {
    setSelectedRemedy(remedy);
    if (remedy) {
      const remedyDetails = ` ${remedy.name}\n ${remedy.source}\n ${remedy.instructions}\n ${remedy.notes || ""}`;
      onPasteRemedy(remedyDetails);
    }
  };

  return (
    <div className="p-4 bg-gray-100 shadow-md h-full rounded-md">
      {/* <div className="mb-4 flex flex-wrap gap-2">
        {selectedRemedy && (
          <span className="ml-2 px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-semibold">
            {t.selected}: {selectedRemedy.name}
          </span>
        )}
      </div> */}
      <input
        type="text"
        placeholder={t.searchRemedies}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      />
      <ul className="space-y-2 overflow-y-auto h-[100vh]">
        {filteredRemedies.map((remedy) => (
          <li
            key={remedy.id}
            className={`p-2 bg-white rounded-md shadow-md hover:bg-blue-100 cursor-pointer flex justify-between items-center ${
              selectedRemedy?.id === remedy.id ? "bg-blue-300 border-2 border-blue-600" : ""
            }`}
            onClick={() => handleSelectRemedy(remedy)}
          >
            <span>{remedy.name}</span>
            {selectedRemedy?.id === remedy.id && (
              <span className="ml-2 text-blue-700 font-bold">{t.selected}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecipeBar;
