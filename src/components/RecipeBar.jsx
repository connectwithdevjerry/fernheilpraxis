import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path to your firebase config
import { useLang } from "../useLang";

const RecipeBar = ({ onPasteRemedy }) => {
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
      const remedyDetails = ` ${remedy.name}\n ${remedy.source}\n ${
        remedy.instructions
      }\n ${remedy.notes || ""}`;
      onPasteRemedy(remedyDetails);
    }
  };

  return (
    <div className="p-2 md:p-4 bg-gray-100 shadow-md h-[50vh] md:h-full rounded-md flex flex-col">
      <input
        type="text"
        placeholder={t.searchRemedies}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-3 md:mb-4 p-2 border border-gray-300 rounded-md focus:ring-[#2f6e44] focus:border-[#2f6e44] transition"
      />
      <ul
        className="space-y-2 overflow-y-auto flex-1 min-h-0 scrollbar-hide"
        style={{
          maxHeight: "80vh", // Adjust as needed for your layout
        }}
      >
        {filteredRemedies.map((remedy) => (
          <li
            key={remedy.id}
            className={`p-2 bg-white rounded-md shadow-md cursor-pointer flex justify-between items-center transition ${
              selectedRemedy?.id === remedy.id
                ? "bg-[#2f6e44] border-2 border-[#2f6e44] text-white"
                : "hover:bg-[#e6f4ec]"
            }`}
            onClick={() => handleSelectRemedy(remedy)}
          >
            <span>{remedy.name}</span>
            {selectedRemedy?.id === remedy.id && (
              <span className="ml-2 font-bold">{t.selected}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecipeBar;
