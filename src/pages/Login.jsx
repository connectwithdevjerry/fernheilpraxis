import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ onAuthenticate }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [showChangePasscode, setShowChangePasscode] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
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

  // Get passcode from localStorage or fallback to default
  const getStoredPasscode = () => localStorage.getItem("coachPasscode") || "1234";

  const handleChangePasscode = (e) => {
    e.preventDefault();
    const storedPass = getStoredPasscode();
    if (currentPass !== storedPass) {
      toast.error("Current passcode is incorrect.");
      return;
    }
    if (!newPass || newPass.length < 4) {
      toast.error("New passcode must be at least 4 characters.");
      return;
    }
    if (newPass !== confirmNewPass) {
      toast.error("New passcodes do not match.");
      return;
    }
    localStorage.setItem("coachPasscode", newPass);
    toast.success("Passcode changed successfully!");
    setShowChangePasscode(false);
    setCurrentPass(""); setNewPass(""); setConfirmNewPass("");
  };

  const handleLogin = () => {
    const storedPasscode = getStoredPasscode();
    if (passcode === storedPasscode) {
      localStorage.setItem("isAuthenticated", "true");
      onAuthenticate();
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
        {!showChangePasscode && (
          <>
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
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 mb-2"
            >
              Login
            </button>
          </>
        )}
        <button
          onClick={() => setShowChangePasscode((v) => !v)}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 mb-2"
        >
          {showChangePasscode ? "Cancel" : "Change Passcode"}
        </button>
        {showChangePasscode && (
          <form onSubmit={handleChangePasscode} className="mt-4 flex flex-col space-y-3">
            <input
              type="password"
              value={currentPass}
              onChange={e => setCurrentPass(e.target.value)}
              placeholder="Current passcode"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="password"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="New passcode"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="password"
              value={confirmNewPass}
              onChange={e => setConfirmNewPass(e.target.value)}
              placeholder="Confirm new passcode"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
            >
              Save New Passcode
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
