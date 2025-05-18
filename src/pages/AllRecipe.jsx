import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // adjust path to your firebase config
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLang } from "../useLang";

const AllRecipe = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [remedies, setRemedies] = useState([]);
  const [selectedRemedy, setSelectedRemedy] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editRemedy, setEditRemedy] = useState(null);
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

  const handleAddRecipe = () => {
    setEditRemedy({ name: "", source: "", instructions: "", notes: "" }); // Initialize a new recipe object
    setShowAddForm(true); // Open the form for adding a new recipe
  };

  const handleUpdateRecipeInFirebase = async () => {
    if (editRemedy) {
      try {
        const updatedRecipe = {
          name: editRemedy.name,
          source: editRemedy.source,
          instructions: editRemedy.instructions,
          notes: editRemedy.notes,
        };

        await updateDoc(doc(db, "recipes", editRemedy.id), updatedRecipe);
        toast.success("Recipe updated successfully!");

        // Update the RecipeBar immediately
        setRemedies(
          remedies.map((remedy) => {
            return remedy.id === editRemedy.id
              ? { ...remedy, ...updatedRecipe }
              : remedy;
          })
        );

        setShowAddForm(false);
        setEditRemedy(null);
      } catch (error) {
        console.error("Error updating recipe: ", error);
        toast.error("Failed to update recipe.");
      }
    }
  };

  const handleEdit = () => {
    if (selectedRemedy) {
      setEditRemedy(selectedRemedy); // Set the selected remedy for editing
      setShowAddForm(true); // Open the form for editing
    }
  };

  const handleDelete = async () => {
    if (selectedRemedy) {
      const confirmDelete = window.confirm("Are you sure you want to delete this recipe?");
      if (!confirmDelete) return;

      try {
        await deleteDoc(doc(db, "recipes", selectedRemedy.id));
        toast.success("Recipe deleted successfully!");

        // Remove the deleted recipe from the local state
        setRemedies(remedies.filter((remedy) => remedy.id !== selectedRemedy.id));
        setSelectedRemedy(null);
      } catch (error) {
        console.error("Error deleting recipe: ", error);
        toast.error("Failed to delete recipe.");
      }
    }
  };

  const handleRecipeClick = (remedy) => {
    setSelectedRemedy(remedy);
  };

  const handleAddRecipeSubmit = async (e) => {
    e.preventDefault();
    if (editRemedy?.id) {
      await handleUpdateRecipeInFirebase();
    } else {
      try {
        const newRecipeRef = await addDoc(collection(db, "recipes"), editRemedy);
        toast.success("Recipe added successfully!");

        // Add the new recipe to the local state
        setRemedies([...remedies, { id: newRecipeRef.id, ...editRemedy }]);
        setShowAddForm(false);
        setEditRemedy(null);
      } catch (error) {
        console.error("Error adding recipe: ", error);
        toast.error("Failed to add recipe.");
      }
    }
  };

  const filteredRemedies = remedies
    .filter((remedy) =>
      remedy.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="p-4 bg-gray-100 shadow-md h-full rounded-md">
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={handleAddRecipe}
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
        >
          + {t.addRecipe}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {selectedRemedy && (
          <>
            <button
              onClick={handleEdit}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-[#2f6e44]"
            >
              {t.edit}
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
            >
              {t.delete}
            </button>
          </>
        )}
      </div>

      <input
        type="text"
        placeholder={t.searchRemedies}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:ring-[#9c3435] focus:border-blue-500"
      />

      <ul className="space-y-2 overflow-y-auto h-[100vh]">
        {filteredRemedies.map((remedy) => (
          <li
            key={remedy.id}
            className={`p-2 bg-white rounded-md shadow-md hover:bg-blue-100 cursor-pointer flex justify-between items-center ${
              selectedRemedy?.id === remedy.id ? "bg-green-200" : ""
            }`}
            onClick={() => handleRecipeClick(remedy)}
          >
            <span>{remedy.name}</span>
          </li>
        ))}
      </ul>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-md w-11/12 md:w-1/2">
            <h2 className="text-xl font-bold mb-4">
              {editRemedy?.id ? t.editRecipe : t.addRecipe}
            </h2>
            <form
              className="space-y-4"
              onSubmit={handleAddRecipeSubmit}
            >
              <input
                type="text"
                placeholder={t.name}
                value={editRemedy?.name || ""}
                onChange={(e) =>
                  setEditRemedy({ ...editRemedy, name: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#9c3435] focus:border-blue-500"
              />
              <input
                type="text"
                placeholder={t.source}
                value={editRemedy?.source || ""}
                onChange={(e) =>
                  setEditRemedy({ ...editRemedy, source: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#9c3435] focus:border-blue-500"
              />
              <textarea
                placeholder={t.instructions}
                value={editRemedy?.instructions || ""}
                onChange={(e) =>
                  setEditRemedy({ ...editRemedy, instructions: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#9c3435] focus:border-blue-500"
              />
              <textarea
                placeholder={t.notes}
                value={editRemedy?.notes || ""}
                onChange={(e) =>
                  setEditRemedy({ ...editRemedy, notes: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#9c3435] focus:border-blue-500"
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-[#2f6e44] text-white py-2 px-4 rounded-md hover:bg-[#a9d15e] focus:outline-none focus:ring-2 focus:ring-[#9c3435] focus:ring-offset-2"
                >
                  {editRemedy?.id ? t.update : t.add}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllRecipe;
