import React from "react";
import { Link } from "react-router-dom";
import {
  FaClipboardList,
  FaUserPlus,
} from "react-icons/fa";
import { useLang } from "../useLang";

const Sidebar = () => {
  const { t } = useLang();
  return (
    <div className="h-full w-full bg-gradient-to-b bg-[#2f6e44] text-white flex flex-col shadow-lg">
      <nav className="flex-1 p-6 space-y-6">
        <Link
          to="/patients"
          className="flex items-center space-x-4 hover:bg-[#a9d15e] p-3 rounded-lg transition duration-300 ease-in-out"
        >
          <FaUserPlus className="text-xl" />
          <span className="text-lg font-medium">{t.patient}</span>
        </Link>
        <Link
          to="/recipes"
          className="flex items-center space-x-4 hover:bg-[#a9d15e] p-3 rounded-lg transition duration-300 ease-in-out"
        >
          <FaClipboardList className="text-xl" />
          <span className="text-lg font-medium">{t.recipe}</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
