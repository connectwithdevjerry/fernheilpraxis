import React from "react";
import { Link } from "react-router-dom";
import {
  FaClipboardList,
  FaUserPlus,
  FaSearch,
  FaHeartbeat,
  FaFolderOpen,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="h-full w-full bg-gradient-to-b bg-blue-600 text-white flex flex-col shadow-lg">
      <nav className="flex-1 p-6 space-y-6">
      <Link
          to="/patients"
          className="flex items-center space-x-4 hover:bg-blue-800 p-3 rounded-lg transition duration-300 ease-in-out"
        >
          <FaUserPlus className="text-xl" />
          <span className="text-lg font-medium">Patient</span>
        </Link>
        <Link
          to="/recipes"
          className="flex items-center space-x-4 hover:bg-blue-800 p-3 rounded-lg transition duration-300 ease-in-out"
        >
          <FaClipboardList className="text-xl" />
          <span className="text-lg font-medium">Recipe</span>
        </Link>
       
      </nav>
    </div>
  );
};

export default Sidebar;
