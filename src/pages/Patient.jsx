import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import PatienForm from '../components/PatientForm';
import { toast } from 'react-toastify';
import { useLang } from "../useLang";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const navigate = useNavigate();
  const { t } = useLang();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [navigate]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'patients'));
        const patientsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPatients(patientsList);
        setFilteredPatients(patientsList);
      } catch (error) {
        console.error('Error fetching patients: ', error);
      }
    };

    fetchPatients();
  }, []);

  const handleNewPatientClick = () => {
    setSelectedPatient(null); // Clear selected patient for new entry
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setShowForm(true);
  };

  const handleDeletePatient = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this patient?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'patients', id));
      const updatedPatients = patients.filter((patient) => patient.id !== id);
      setPatients(updatedPatients);
      setFilteredPatients(updatedPatients);
      toast.success('Patient deleted successfully!');
    } catch (error) {
      console.error('Error deleting patient: ', error);
      toast.error('Failed to delete patient.');
    }
  };

  const handleSavePatient = async (updatedPatient) => {
    try {
      if (updatedPatient.id) {
        // Update existing patient in Firestore
        const patientRef = doc(db, "patients", updatedPatient.id);
        await updateDoc(patientRef, updatedPatient);

        // Update local state
        const updatedPatients = patients.map((patient) =>
          patient.id === updatedPatient.id ? updatedPatient : patient
        );
        setPatients(updatedPatients);
        setFilteredPatients(updatedPatients);
        toast.success("Patient updated successfully!");
      } else {
        // Add new patient to Firestore
        const newPatientRef = await addDoc(collection(db, "patients"), updatedPatient);
        const newPatient = { id: newPatientRef.id, ...updatedPatient };

        // Update local state
        setPatients([...patients, newPatient]);
        setFilteredPatients([...filteredPatients, newPatient]);
        toast.success("Patient added successfully!");
      }

      setShowForm(false);
    } catch (error) {
      console.error("Error saving patient: ", error);
      toast.error("Failed to save patient.");
    }
  };

  const handleSearch = (searchTerm) => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = patients.filter((patient) =>
      patient.name.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredPatients(filtered);
  };

  const sortedPatients = [...filteredPatients].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const handleRowClick = (patient) => {
    navigate(`/patients/${patient.id}`, { state: { patient } });
  };

  return (
    <div className="h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder={t.searchPatients}
            onChange={(e) => handleSearch(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-4 w-1/2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleNewPatientClick}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t.addNewPatient}
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">{t.patientList}</h2>
          <table className="w-full border-collapse border border-gray-300 text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 py-3 px-4">#</th>
                <th className="border border-gray-300 py-3 px-4">{t.name}</th>
                <th className="border border-gray-300 py-3 px-4">{t.birthday}</th>
                <th className="border border-gray-300 py-3 px-4">{t.sex}</th>
                <th className="border border-gray-300 py-3 px-4">{t.age}</th>
                <th className="border border-gray-300 py-3 px-4">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {sortedPatients.map((patient, index) => (
                <tr
                  key={patient.id}
                  className="hover:bg-gray-100 transition duration-200 ease-in-out cursor-pointer"
                  onClick={() => handleRowClick(patient)}
                >
                  <td className="border border-gray-300 py-3 px-4">{index + 1}</td>
                  <td className="border border-gray-300 py-3 px-4">{patient.name}</td>
                  <td className="border border-gray-300 py-3 px-4">{patient.birthday}</td>
                  <td className="border border-gray-300 py-3 px-4">{patient.sex}</td>
                  <td className="border border-gray-300 py-3 px-4">{patient.age}</td>
                  <td className="border border-gray-300 py-3 px-4 flex justify-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPatient(patient);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-lg transition duration-200 ease-in-out"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePatient(patient.id);
                      }}
                      className="text-red-600 hover:text-red-800 text-lg transition duration-200 ease-in-out"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-1/2">
              <button
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700 float-right text-xl"
              >
                <FaTimes />
              </button>
              <PatienForm patient={selectedPatient} onSave={handleSavePatient} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;