import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { FaCopy } from "react-icons/fa";

const PatientPrescriptions = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [navigate]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      const prescriptionsRef = collection(db, "patients", patientId, "prescriptions");
      const snapshot = await getDocs(prescriptionsRef);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPrescriptions(data);
      setLoading(false);
    };

    fetchPrescriptions();
  }, [patientId]);

  const handleCreatePrescription = () => {
    navigate(`/patients/${patientId}/recipes`);
  };

  const handleCopyToRecipe = (prescription) => {
    const { coachName, date, content } = prescription;
    const recipeData = {
      coachName,
      date: date?.toDate().toISOString(),
      content,
    };
    localStorage.setItem("recipeData", JSON.stringify(recipeData));
    navigate(`/patients/${patientId}/recipes`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Prescriptions</h2>
        <button
          onClick={handleCreatePrescription}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Create Prescription
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : prescriptions.length === 0 ? (
        <p className="text-gray-500">No prescriptions found.</p>
      ) : (
        <ul className="space-y-4">
          {prescriptions.map((p) => (
            <li key={p.id} className="border p-4 rounded-md shadow">
              <p><strong>Date:</strong> {p.date?.toDate().toLocaleString()}</p>
              <p><strong>Coach:</strong> {p.coachName}</p>
              <div>
                <strong>Content:</strong>
                <div
                  className="mt-2 p-2 border rounded bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: p.content }}
                />
                <button
                  onClick={() => handleCopyToRecipe(p)}
                  className="mt-2 flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  <FaCopy className="w-6 h-6 mr-2" />
                  Copy
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientPrescriptions;
