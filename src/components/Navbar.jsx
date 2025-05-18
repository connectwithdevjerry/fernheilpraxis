import { FaFolderOpen, FaSignOutAlt, FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLang } from "../useLang";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { language, setLanguage, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const authState = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(authState === "true");

    const handleStorage = () => {
      const updatedAuth = localStorage.getItem("isAuthenticated");
      setIsAuthenticated(updatedAuth === "true");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow px-4 py-2 flex flex-col md:flex-row md:justify-between md:items-center">
      <div className="flex items-center justify-between w-full md:w-auto">
        <img src="/Logo.png" alt="Logo" className="w-[64px] md:w-[80px] h-auto" />
        {/* Hamburger for mobile */}
        <button
          className="md:hidden ml-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2f6e44]"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          <FaBars className="text-2xl text-[#2f6e44]" />
        </button>
      </div>
      {/* Desktop menu */}
      <div className="hidden md:flex items-center">
        <button
          onClick={() => setLanguage(language === "en" ? "de" : "en")}
          className={`mr-4 flex items-center gap-2 px-3 py-1 rounded-full shadow border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2f6e44] focus:ring-offset-2
            ${
              language === "en"
                ? "bg-gradient-to-r from-gray-200 to-gray-400 text-[#2f6e44] border-[#2f6e44] hover:from-gray-300 hover:to-gray-500"
                : "bg-gradient-to-r from-[#2f6e44] to-green-700 text-white border-[#2f6e44] hover:from-green-700 hover:to-[#2f6e44]"
            }
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
        <div className="pl-2">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-lg font-medium text-gray-800">{t.helloCoach}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-800 hover:text-[#2f6e44] p-2 rounded-lg transition duration-300 ease-in-out"
              >
                <FaSignOutAlt className="text-xl" />
                <span className="text-lg font-medium">{t.logout}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 text-gray-800 hover:text-[#2f6e44] p-2 rounded-lg transition duration-300 ease-in-out"
            >
              <FaFolderOpen className="text-xl" />
              <span className="text-lg font-medium">{t.login}</span>
            </button>
          )}
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-start mt-2 space-y-2">
          <button
            onClick={() => setLanguage(language === "en" ? "de" : "en")}
            className={`flex items-center gap-2 px-3 py-1 rounded-full shadow border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2f6e44] focus:ring-offset-2
              ${
                language === "en"
                  ? "bg-gradient-to-r from-gray-200 to-gray-400 text-[#2f6e44] border-[#2f6e44] hover:from-gray-300 hover:to-gray-500"
                  : "bg-gradient-to-r from-[#2f6e44] to-green-700 text-white border-[#2f6e44] hover:from-green-700 hover:to-[#2f6e44]"
              }
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
          {isAuthenticated ? (
            <div className="flex flex-col items-start space-y-2">
              <span className="text-lg font-medium text-gray-800">{t.helloCoach}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-800 hover:text-[#2f6e44] p-2 rounded-lg transition duration-300 ease-in-out"
              >
                <FaSignOutAlt className="text-xl" />
                <span className="text-lg font-medium">{t.logout}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 text-gray-800 hover:text-[#2f6e44] p-2 rounded-lg transition duration-300 ease-in-out"
            >
              <FaFolderOpen className="text-xl" />
              <span className="text-lg font-medium">{t.login}</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;