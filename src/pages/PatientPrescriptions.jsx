import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { FaCopy, FaTrash } from "react-icons/fa";
import { useLang } from "../useLang";

const PatientPrescriptions = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

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

  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm(t.confirmDeletePrescription)) return;
    try {
      await deleteDoc(doc(db, "patients", patientId, "prescriptions", prescriptionId));
      setPrescriptions((prev) => prev.filter((p) => p.id !== prescriptionId));
      window.toast && window.toast.success ? window.toast.success(t.prescriptionDeleted) : alert(t.prescriptionDeleted);
    } catch {
      window.toast && window.toast.error ? window.toast.error(t.failedToDeletePrescription) : alert(t.failedToDeletePrescription);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t.prescriptions}</h2>
        <button
          onClick={handleCreatePrescription}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + {t.createPrescription}
        </button>
      </div>

      {loading ? (
        <p>{t.loading}</p>
      ) : prescriptions.length === 0 ? (
        <p className="text-gray-500">{t.noPrescriptionsFound}</p>
      ) : (
        <ul className="space-y-4">
          {prescriptions.map((p) => (
            <li key={p.id} className="border p-4 rounded-md shadow">
              <p><strong>{t.date}:</strong> {p.date?.toDate().toLocaleString()}</p>
              <p><strong>{t.coach}:</strong> {p.coachName}</p>
              <div>
                <strong>{t.content}:</strong>
                <div
                  className="mt-2 p-2 border rounded bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: p.content }}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleCopyToRecipe(p)}
                    className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    <FaCopy className="w-6 h-6 mr-2" />
                    {t.copy}
                  </button>
                  <button
                    onClick={() => handleDeletePrescription(p.id)}
                    className="flex items-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                  >
                    <FaTrash className="w-5 h-5 mr-2" />
                    {t.delete}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientPrescriptions;
