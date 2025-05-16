import React, { useState } from 'react';

const PatientForm = ({ patient, onSave }) => {
  const [formData, setFormData] = useState({
    name: patient?.name || "",
    birthday: patient?.birthday || "",
    sex: patient?.sex || "",
    age: patient?.age || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave({ ...patient, ...formData }); // Pass updated data to the parent component
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {patient ? "Edit Patient" : "Add Patient"}
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            placeholder="Enter patient's name"
          />
        </div>

        <div>
          <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
            Birthday
          </label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          />
        </div>

        <div>
          <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
            Sex
          </label>
          <select
            id="sex"
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700">
            Age
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            placeholder="Enter patient's age"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {patient ? "Update" : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default PatientForm;