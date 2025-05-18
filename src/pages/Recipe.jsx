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
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLang } from "../useLang";

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
  const navigate = useNavigate();
  const [coachName, setCoachName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [prescriptionDate, setPrescriptionDate] = useState(formatTodayDate());

  const [selectedRecipe, setSelectedRecipe] = useState("");
  const { patientId } = useParams();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  const { t } = useLang();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Save prescription to firebase
  const handleSaveToDatabase = async () => {
    if (!coachName || !prescriptionDate || !selectedRecipe) {
      toast.error(t.fillAllFields || "Bitte füllen Sie alle Felder aus.");
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

      toast.success(t.recipeAdded || "Rezept erfolgreich hinzugefügt!");
      navigate(`/patients/${patientId}`); // <-- Add this line
    } catch (error) {
      console.error("Error saving prescription:", error);
      toast.error(
        t.failedToSavePrescription || "Speichern des Rezepts fehlgeschlagen."
      );
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
          setPatientName(patientData.name || "");
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
      toast.success(t.recipeAdded || "Rezept erfolgreich hinzugefügt!");

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
      // Replace undefined with empty string in remedyDetails
      const safeRemedyDetails = remedyDetails.replace(/undefined/g, "");
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      textarea.value = `${before}${safeRemedyDetails}${after}`;
      textarea.setSelectionRange(
        start + safeRemedyDetails.length,
        start + safeRemedyDetails.length
      );
      textarea.focus();
      setSelectedRecipe(textarea.value);
    }
  };

  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handlePrint = async () => {
    const printContent = document.getElementById("print").cloneNode(true);

    // Convert logo from public folder to base64
    const logoBase64 = await loadImageAsBase64("/Logo.png");
    const clonedLogo = printContent.querySelector("img");
    if (clonedLogo) {
      clonedLogo.src = logoBase64;
    }

    // Replace textarea with plain text block
    const textareas = printContent.querySelectorAll("textarea");
    textareas.forEach((textarea) => {
      const contentDiv = document.createElement("div");
      contentDiv.textContent = textarea.value;
      contentDiv.style.whiteSpace = "pre-wrap";
      contentDiv.style.border = "1px solid #ccc";
      contentDiv.style.padding = "1rem";
      contentDiv.style.minHeight = "200px";
      contentDiv.style.fontFamily = "inherit";
      textarea.parentNode.replaceChild(contentDiv, textarea);
    });

    // Replace coach input
    const coachInput = printContent.querySelector("#coach-name");
    if (coachInput) {
      const coachText = document.createElement("strong");
      coachText.textContent = coachInput.value;
      coachInput.parentNode.replaceChild(coachText, coachInput);
    }

    // Replace date input
    const dateInput = printContent.querySelector('input[type="date"]');
    if (dateInput) {
      const formattedDate = new Date(
        dateInput.value || new Date()
      ).toLocaleDateString();
      const dateText = document.createElement("strong");
      dateText.textContent = formattedDate;
      dateText.style.float = "right";
      dateText.style.fontWeight = "bold";
      dateInput.parentNode.replaceChild(dateText, dateInput);
    }

    // Replace patient name with <strong>
    const patientInput = printContent.querySelector("#user-name");
    if (patientInput) {
      const patientText = document.createElement("strong");
      patientText.textContent = patientInput.textContent;
      patientInput.parentNode.replaceChild(patientText, patientInput);
    }

    // Remove Save button
    const saveBtn = printContent.querySelector("button");
    if (saveBtn) saveBtn.remove();

    // Print logic
    const printWindow = window.open("", "", "width=900,height=650");
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Prescription Print</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            strong { font-weight: bold; }
            img { max-width: 96px; max-height: 96px; object-fit: contain; float: right; }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div>
              <h1 style="font-size: 20px; font-weight: bold; margin: 0;">Fernheilpraxis - Praxisgemeinschaft</h1>
              <p style="margin: 4px 0;">Heilpraktiker Matthias Cebula</p>
              <p style="margin: 4px 0; color: #2196F3;">www.fernheilpraxis.com</p>
              <p style="margin: 4px 0; color: #666;">info@fernheilpraxis.com</p>
            </div>
            <img id="logo-img" src="${logoBase64}" alt="Logo" />
          </div>
          <hr />
          ${printContent.innerHTML}
          <script>
            // Wait for the image to load before printing
            const logo = document.getElementById('logo-img');
            if (logo && !logo.complete) {
              logo.onload = function() { window.print(); window.close(); };
            } else {
              window.print(); window.close();
            }
          </script>
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  // Save as PDF
  const handleSaveAsPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 8;
    let currentY = 10;

    const printDiv = document.getElementById("print");
    if (!printDiv) {
      alert("Print section not found.");
      return;
    }

    const coachName = document.getElementById("coach-name")?.value || "N/A";
    const prescriptionDate =
      document.querySelector("input[type='date']")?.value || "N/A";
    const patientName =
      document.getElementById("user-name")?.textContent.trim() || "N/A";
    const recipeText =
      printDiv.querySelector("textarea")?.value || "No recipe provided.";

    // === Load Logo ===
    const logoImg = await loadImageAsBase64("/Logo.png");

    // === Header ===
    const headerX = marginLeft;
    const headerTop = currentY;
    const logoWidth = 40;
    const logoHeight = 30;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Fernheilpraxis - Praxisgemeinschaft", headerX, headerTop);

    if (logoImg) {
      doc.addImage(
        logoImg,
        "PNG",
        pageWidth - logoWidth - marginLeft,
        headerTop - 4,
        logoWidth,
        logoHeight
      );
    }

    currentY += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Heilpraktiker Matthias Cebula", marginLeft, currentY);
    currentY += 6;
    doc.setTextColor(33, 150, 243);
    doc.text("www.fernheilpraxis.com", marginLeft, currentY);
    currentY += 6;
    doc.setTextColor(100, 100, 100);
    doc.text("info@fernheilpraxis.com", marginLeft, currentY);
    currentY += 8;

    doc.setDrawColor(100);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
    currentY += 8;

    // === Details ===
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Rezept Daten", marginLeft, currentY);
    currentY += 6;

    doc.setFont("helvetica", "normal");
    doc.text(`Coach: ${coachName}`, marginLeft, currentY);
    currentY += 6;
    doc.text(`Datum: ${prescriptionDate}`, marginLeft, currentY);
    currentY += 6;
    doc.text(`Patient: ${patientName}`, marginLeft, currentY);
    currentY += 6;

    // === Recipe Content ===
    doc.setFont("helvetica", "bold");
    doc.text("Rezept", marginLeft, currentY);
    currentY += 6;

    doc.setFont("helvetica", "normal");
    const wrappedText = doc.splitTextToSize(
      recipeText,
      pageWidth - 2 * marginLeft
    );

    wrappedText.forEach((line) => {
      if (currentY + 10 > pageHeight - 10) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(line, marginLeft, currentY);
      currentY += 6;
    });

    doc.save("Rezept.pdf");
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen">
      <div className="w-full md:w-3/4 p-6 bg-white shadow-md rounded-md">
        <div className="flex flex-row items-center justify-between mb-4">
          {/* Left: Practice Info */}
          <div className="flex flex-col items-start">
            <h1 className="text-2xl font-bold text-gray-800">
              Fernheilpraxis - Praxisgemeinschaft
            </h1>
            <p className="text-gray-600">Heilpraktiker Matthias Cebula</p>
            <p className="text-blue-500">www.fernheilpraxis.com</p>
            <p className="text-gray-600">info@fernheilpraxis.com</p>
          </div>
          {/* Right: Logo */}
          <div id="" className="flex-shrink-0 ml-6">
            <img
              src="/Logo.png"
              alt="Logo"
              className="w-26 h-26 object-contain"
              style={{ maxWidth: "96px", maxHeight: "96px" }}
            />
          </div>
        </div>
        <hr className="border-t-4 border-gray-700 my-4" />
        <div className="" id="print">
          <div
            id="date-coach"
            className="flex items-center justify-between md:flex-row gap-4 mb-4"
          >
            <div className="flex w-1/4 gap-4 items-center">
              <label htmlFor="coach-name" className="text-gray-700 font-medium">
                {t.coach || "Coach"}:
              </label>
              <input
                id="coach-name"
                type="text"
                placeholder={t.coachName || "Coach Name"}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#9c3435] focus:border-blue-500"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
              />
            </div>
            <input
              type="date"
              className="w-full md:w-1/4 p-2 border border-gray-300 rounded-md focus:ring-[#9c3435] focus:border-blue-500"
              value={prescriptionDate}
              onChange={(e) => setPrescriptionDate(e.target.value)}
              placeholder={formatTodayDate()} // Set today's date as placeholder
            />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <label className="text-gray-700 font-medium" htmlFor="">
              {t.patient || "Patient"}:
            </label>
            <p className="font-bold" id="user-name">
              {patientName}
            </p>
          </div>
          <textarea
            value={selectedRecipe}
            onChange={(e) => setSelectedRecipe(e.target.value)}
            className="w-full h-90 md:h-[60vh] border border-gray-300 rounded-md p-4 focus:ring-[#9c3435] focus:border-blue-500 resize-none"
            placeholder={
              t.recipePlaceholder || "Type or edit your recipe here..."
            }
          />
        </div>

        <button
          onClick={handleSaveToDatabase}
          className="m-auto rounded-lg p-3 font-semibold text-white bg-[#2f6e44]"
        >
          {t.saveToDatabase}
        </button>
      </div>
      <div className="w-full md:w-1/4 p-6">
        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="mb-4 bg-[#2f6e44] text-white py-2 px-4 rounded-md hover:bg-[#a9d15e] focus:outline-none focus:ring-2 focus:ring-[#9c3435] focus:ring-offset-2 w-full md:w-auto shadow-md"
          >
            Export ▼
          </button>

          {isOpen && (
            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white border border-gray-200 shadow-lg">
              <div className="py-1 text-gray-700 text-sm">
                <button
                  onClick={handlePrint}
                  className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <FaPrint className="mr-2 text-blue-500" /> {t.print}
                </button>
                <button
                  onClick={handleSaveAsPDF}
                  className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <FaFilePdf className="mr-2 text-red-500" /> {t.saveAsPDF}
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#9c3435] focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Source"
                value={newRemedy.source}
                onChange={(e) =>
                  setNewRemedy({ ...newRemedy, source: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#9c3435] focus:border-blue-500"
              />
              <textarea
                placeholder="Instructions"
                value={newRemedy.instructions}
                onChange={(e) =>
                  setNewRemedy({ ...newRemedy, instructions: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#9c3435] focus:border-blue-500"
              />
              <textarea
                placeholder="Notes"
                value={newRemedy.notes}
                onChange={(e) =>
                  setNewRemedy({ ...newRemedy, notes: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#9c3435] focus:border-blue-500"
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
                  className="bg-[#2f6e44] text-white py-2 px-4 rounded-md hover:bg-[#a9d15e] focus:outline-none focus:ring-2 focus:ring-[#9c3435] focus:ring-offset-2 w-full md:w-auto"
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
