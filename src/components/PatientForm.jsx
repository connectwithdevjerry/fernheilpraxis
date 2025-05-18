import React, { useState } from "react";
import { useLang } from "../useLang";

const PatientForm = ({ patient, onSave }) => {
  const { t } = useLang();

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
        {patient ? t.update : t.addNewPatient}
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            {t.name}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-[#9c3435] focus:border-blue-500 sm:text-sm p-2"
            placeholder={t.name}
          />
        </div>

        <div>
          <label
            htmlFor="birthday"
            className="block text-sm font-medium text-gray-700"
          >
            {t.birthday}
          </label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-[#9c3435] focus:border-blue-500 sm:text-sm p-2"
          />
        </div>

        <div>
          <label
            htmlFor="sex"
            className="block text-sm font-medium text-gray-700"
          >
            {t.sex}
          </label>
          <select
            id="sex"
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            style={{ color: formData.sex ? "#2f6e44" : undefined }}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-[#9c3435]  sm:text-sm p-2"
          >
            <option value="">{t.select || "Select"}</option>
            <option value="male">{t.male || "Male"}</option>
            <option value="female">{t.female || "Female"}</option>
            <option value="other">{t.other || "Other"}</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-gray-700"
          >
            {t.age}
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-[#9c3435]  sm:text-sm p-2"
            placeholder={t.age}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-bg-[#2f6e44] text-white bg-[#2f6e44] py-2 px-4 rounded-md hover:bg-[#a9d15e] focus:outline-none focus:ring-2 focus:ring-[#9c3435] focus:ring-offset-2"
        >
          {patient ? t.update : t.submit}
        </button>
      </form>
    </div>
  );
};

export default PatientForm;
