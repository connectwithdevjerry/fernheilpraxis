import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ onAuthenticate }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      onAuthenticate(); // Keep App in sync
      navigate("/patients");
    } else {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [navigate, onAuthenticate]);

  const handleLogin = () => {
    const predefinedPasscode = "1234"; // Secure this in a real application
    if (passcode === predefinedPasscode) {
      localStorage.setItem("isAuthenticated", "true");
      onAuthenticate(); // Update App state
      toast.success("Login successful! Redirecting...");
      navigate("/patients");
    } else {
      setError("Invalid passcode. Please try again.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-8 flex flex-col bg-white shadow-lg rounded-lg w-96">
        <img src="/Logo.png" alt="" className="flex m-auto w-[200px]" />
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Welcome Back</h1>
        <p className="text-center text-gray-600 mb-4">Please enter your passcode to continue</p>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Enter your passcode"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 text-gray-700"
        />
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
