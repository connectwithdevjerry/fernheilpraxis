import React, { useState, useRef, useEffect } from "react";
import { FaPrint, FaFilePdf, FaGoogleDrive } from "react-icons/fa";
import RecipeBar from "../components/RecipeBar";
import remediesData from "../data/remedies.json";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Optional for table formatting
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Formatting the date
const formatTodayDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${year}-${month}-${day}`; // Updated to ISO format for date input
};

const Recipe = () => {
  const [remedies, setRemedies] = useState(remediesData);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRemedy, setNewRemedy] = useState({
    name: "",
    source: "",
    instructions: "",
    notes: "",
  });
  const [editRemedy, setEditRemedy] = useState(null);

  const [coachName, setCoachName] = useState("");
  const [prescriptionDate, setPrescriptionDate] = useState(formatTodayDate());

  const [selectedRecipe, setSelectedRecipe] = useState("");
  const { patientId } = useParams();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Save prescription to firebase
  const handleSaveToDatabase = async () => {
    if (!coachName || !prescriptionDate || !selectedRecipe) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const [year, month, day] = prescriptionDate.split("-");
      const parsedDate = new Date(`${year}-${month}-${day}`);

      const prescriptionRef = collection(
        db,
        "patients",
        patientId,
        "prescriptions"
      );
      await addDoc(prescriptionRef, {
        coachName,
        content: selectedRecipe,
        date: Timestamp.fromDate(parsedDate),
        createdAt: Timestamp.now(),
      });

      toast.success("Prescription saved successfully!");
    } catch (error) {
      console.error("Error saving prescription:", error);
      toast.error("Failed to save prescription.");
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const recipeData = JSON.parse(localStorage.getItem("recipeData"));
    if (recipeData) {
      const { coachName, date, content } = recipeData;
      setCoachName(coachName);
      setPrescriptionDate(date);
      setSelectedRecipe(content);
      localStorage.removeItem("recipeData"); // Clear the data after populating
    }
  }, []);

  useEffect(() => {
    const fetchPatientName = async () => {
      try {
        const patientRef = doc(db, "patients", patientId);
        const patientDoc = await getDoc(patientRef);
        if (patientDoc.exists()) {
          const patientData = patientDoc.data();
          document.getElementById("user-name").textContent = patientData.name;
        } else {
          console.error("No such patient document!");
        }
      } catch (error) {
        console.error("Error fetching patient name:", error);
      }
    };

    fetchPatientName();
  }, [patientId]);

  const handleRecipeClick = (recipeContent) => {
    setSelectedRecipe((prev) => `${prev}\n${recipeContent}`);
  };

  const handleEditRemedy = (remedy) => {
    setEditRemedy(remedy);
    setShowAddForm(true);
    setNewRemedy(remedy);
  };

  const handleSaveRecipeToFirebase = async () => {
    try {
      const newRecipe = {
        name: newRemedy.name,
        source: newRemedy.source,
        instructions: newRemedy.instructions,
        notes: newRemedy.notes,
      };

      const docRef = await addDoc(collection(db, "recipes"), newRecipe);
      toast.success("Recipe added successfully!");

      // Update the RecipeBar immediately
      setRemedies([...remedies, { id: docRef.id, ...newRecipe }]);

      // Clear the form after adding
      setNewRemedy({ name: "", source: "", instructions: "", notes: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding recipe: ", error);
      toast.error("Failed to add recipe.");
    }
  };

  const handleUpdateRecipeInFirebase = async () => {
    if (editRemedy) {
      try {
        const updatedRecipe = {
          name: newRemedy.name,
          source: newRemedy.source,
          instructions: newRemedy.instructions,
          notes: newRemedy.notes,
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
        setNewRemedy({ name: "", source: "", instructions: "", notes: "" });
      } catch (error) {
        console.error("Error updating recipe: ", error);
        toast.error("Failed to update recipe.");
      }
    }
  };

  const handlePasteRemedy = (remedyDetails) => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      textarea.value = `${before}${remedyDetails}${after}`;
      textarea.setSelectionRange(
        start + remedyDetails.length,
        start + remedyDetails.length
      );
      textarea.focus();
      setSelectedRecipe(textarea.value);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("print").cloneNode(true);
    // Expand all textareas or scrollable divs to show full content
    const scrollables = printContent.querySelectorAll(
      "textarea, [style*='overflow']"
    );
    scrollables.forEach((el) => {
      el.style.height = el.scrollHeight + "700px"; // Expand to full content
      el.style.overflow = "visible";
    });
    // Remove the Save to Database button from the cloned content
    const buttons = printContent.getElementsByTagName("button");
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].textContent.includes("Save to Database")) {
        buttons[i].remove();
        break;
      }
    }

    // Hide all input borders in the print content
    const inputs = printContent.querySelectorAll("input");
    inputs.forEach((input) => {
      input.style.border = "none";
    });

    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore the original content
  };

const handleSaveAsPDF = () => {
  const doc = new jsPDF();
  const marginLeft = 15;
  let currentY = 20;

  const printDiv = document.getElementById("print");

  if (!printDiv) {
    alert("Print section not found.");
    return;
  }

  // Fetch dynamic values
  const coachName = document.getElementById("coach-name")?.value || "N/A";
  const prescriptionDate = document.querySelector("input[type='date']")?.value || "N/A";
  const patientName = document.getElementById("user-name")?.textContent.trim() || "N/A";
  const recipeText = printDiv.querySelector("textarea")?.value || "No recipe provided.";

  // === Header ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Fernheilpraxis - Praxisgemeinschaft", marginLeft, currentY);
  currentY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Heilpraktiker Matthias Cebula", marginLeft, currentY);
  currentY += 6;
  doc.setTextColor(33, 150, 243); // Blue color
  doc.text("www.fernheilpraxis.com", marginLeft, currentY);
  currentY += 6;
  doc.setTextColor(100, 100, 100); // Dark gray
  doc.text("info@fernheilpraxis.com", marginLeft, currentY);
  currentY += 8;

  // Line separator
  doc.setDrawColor(100);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY, 200 - marginLeft, currentY);
  currentY += 10;

  // === Details ===
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Prescription Details", marginLeft, currentY);
  currentY += 8;

  doc.setFont("helvetica", "normal");
  doc.text(`Coach: ${coachName}`, marginLeft, currentY);
  currentY += 6;
  doc.text(`Date: ${prescriptionDate}`, marginLeft, currentY);
  currentY += 6;
  doc.text(`Patient: ${patientName}`, marginLeft, currentY);
  currentY += 10;

  // === Recipe Content ===
  doc.setFont("helvetica", "bold");
  doc.text("Recipe", marginLeft, currentY);
  currentY += 8;

  doc.setFont("helvetica", "normal");
  const wrappedText = doc.splitTextToSize(recipeText, 180);
  doc.text(wrappedText, marginLeft, currentY);

  // Save the PDF
  doc.save("prescription.pdf");
};


  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen">
      <div
        id="print"
        className="w-full md:w-3/4 p-6 bg-white shadow-md rounded-md"
      >
        <div className="flex flex-col items-center justify-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Fernheilpraxis - Praxisgemeinschaft
          </h1>
          <p className="text-gray-600">Heilpraktiker Matthias Cebula</p>
          <p className="text-blue-500">www.fernheilpraxis.com</p>
          <p className="text-gray-600">info@fernheilpraxis.com</p>
        </div>
        <hr className="border-t-4 border-gray-700 my-4" />
        <div
          id="date-coach"
          className="flex items-center justify-between md:flex-row gap-4 mb-4"
        >
          <div className="flex w-1/4 gap-4 items-center">
            <label htmlFor="coach-name" className="text-gray-700 font-medium">
              Coach:
            </label>
            <input
              id="coach-name"
              type="text"
              placeholder="Coach Name"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
            />
          </div>
          <input
            type="date"
            className="w-full md:w-1/4 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={prescriptionDate}
            onChange={(e) => setPrescriptionDate(e.target.value)}
            placeholder={formatTodayDate()} // Set today's date as placeholder
          />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <label className="text-gray-700 font-medium" htmlFor="">
            Patient:
          </label>
          <p className="font-bold" id="user-name"></p>
        </div>
        <textarea
          value={selectedRecipe}
          onChange={(e) => setSelectedRecipe(e.target.value)}
          className="w-full h-90 md:h-[60vh] border border-gray-300 rounded-md p-4 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Type or edit your recipe here..."
        />
        <button
          onClick={handleSaveToDatabase}
          className="m-auto rounded-lg p-3 font-semibold text-white bg-blue-600"
        >
          Save to Database
        </button>
      </div>
      <div className="w-full md:w-1/4 p-6">
        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="mb-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full md:w-auto shadow-md"
          >
            Save ▼
          </button>

          {isOpen && (
            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white border border-gray-200 shadow-lg">
              <div className="py-1 text-gray-700 text-sm">
                <button
                  onClick={handlePrint}
                  className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <FaPrint className="mr-2 text-blue-500" /> Print
                </button>
                <button
                  onClick={handleSaveAsPDF}
                  className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <FaFilePdf className="mr-2 text-red-500" /> Save as PDF
                </button>
                
              </div>
            </div>
          )}
        </div>
        <RecipeBar
          onRecipeClick={handleRecipeClick}
          onEditRemedy={handleEditRemedy}
          onPasteRemedy={handlePasteRemedy}
        />
      </div>
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-md w-11/12 md:w-1/2">
            <h2 className="text-xl font-bold mb-4">
              {editRemedy ? "Edit Remedy" : "Add New Remedy"}
            </h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                editRemedy
                  ? handleUpdateRecipeInFirebase()
                  : handleSaveRecipeToFirebase();
              }}
            >
              <input
                type="text"
                placeholder="Name"
                value={newRemedy.name}
                onChange={(e) =>
                  setNewRemedy({ ...newRemedy, name: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Source"
                value={newRemedy.source}
                onChange={(e) =>
                  setNewRemedy({ ...newRemedy, source: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                placeholder="Instructions"
                value={newRemedy.instructions}
                onChange={(e) =>
                  setNewRemedy({ ...newRemedy, instructions: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                placeholder="Notes"
                value={newRemedy.notes}
                onChange={(e) =>
                  setNewRemedy({ ...newRemedy, notes: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 w-full md:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full md:w-auto"
                >
                  {editRemedy ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipe;
