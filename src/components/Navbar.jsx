import { FaFolderOpen, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLang } from "../useLang";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { language, setLanguage, t } = useLang();

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
      <div className="flex items-center">
        <button
          onClick={() => setLanguage(language === "en" ? "de" : "en")}
          className={`mr-4 flex items-center gap-2 px-3 py-1 rounded-full shadow border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
            ${language === "en"
              ? "bg-gradient-to-r from-gray-200 to-gray-400 text-blue-800 border-blue-400 hover:from-gray-300 hover:to-gray-500"
              : "bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-600 hover:from-blue-600 hover:to-blue-800"}
          `}
          aria-label="Toggle language"
        >
          <span className="font-semibold text-base">
            {language === "en" ? "DE" : "EN"}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6l4 2"
            />
          </svg>
        </button>
        <div className="p-6">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-lg font-medium text-gray-800">{t.helloCoach}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 p-2 rounded-lg transition duration-300 ease-in-out"
              >
                <FaSignOutAlt className="text-xl" />
                <span className="text-lg font-medium">{t.logout}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 p-2 rounded-lg transition duration-300 ease-in-out"
            >
              <FaFolderOpen className="text-xl" />
              <span className="text-lg font-medium">{t.login}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
