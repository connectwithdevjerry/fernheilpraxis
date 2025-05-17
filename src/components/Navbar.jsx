import { FaFolderOpen, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authState = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(authState === "true");

    // Listen for changes in localStorage (login/logout from other tabs or programmatically)
    const handleStorage = () => {
      const updatedAuth = localStorage.getItem("isAuthenticated");
      setIsAuthenticated(updatedAuth === "true");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Update isAuthenticated state on login/logout in the same tab
  useEffect(() => {
    const interval = setInterval(() => {
      const authState = localStorage.getItem("isAuthenticated");
      setIsAuthenticated(authState === "true");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const authState = localStorage.getItem("isAuthenticated");
    if (authState !== "true") {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated"); // Clear authentication state
    navigate("/login"); // Redirect to login page
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow px-4 flex justify-between items-center">
      <div className="">
        <img src="/Logo.png" alt="Logo" className="w-[80px]" />
      </div>
      <div className="p-6">
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <span className="text-lg font-medium text-gray-800">Hello Coach</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 p-2 rounded-lg transition duration-300 ease-in-out"
            >
              <FaSignOutAlt className="text-xl" />
              <span className="text-lg font-medium">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 p-2 rounded-lg transition duration-300 ease-in-out"
          >
            <FaFolderOpen className="text-xl" />
            <span className="text-lg font-medium">Login</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
