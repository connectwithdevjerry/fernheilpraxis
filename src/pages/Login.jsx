import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useLang } from "../useLang";

const Login = ({ onAuthenticate }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [showChangePasscode, setShowChangePasscode] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLang();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      onAuthenticate(); // Keep App in sync
      navigate("/patients");
    } else {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [navigate, onAuthenticate]);

  // Fetch passcode from Firestore
  const fetchPasscode = async () => {
    const passRef = doc(db, "settings", "coachPasscode");
    const passSnap = await getDoc(passRef);
    if (passSnap.exists()) {
      return passSnap.data().value;
    }
    // If not set, default to '1234'
    return "1234";
  };

  const handleChangePasscode = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Fetch admin passcode from Firestore
    const adminRef = doc(db, "settings", "adminPasscode");
    const adminSnap = await getDoc(adminRef);
    const adminPasscode = adminSnap.exists() ? adminSnap.data().value : "admin1234";
    if (adminPass !== adminPasscode) {
      toast.error(t.adminPassIncorrect);
      setLoading(false);
      return;
    }
    const storedPass = await fetchPasscode();
    if (currentPass !== storedPass) {
      toast.error(t.currentPassIncorrect);
      setLoading(false);
      return;
    }
    if (!newPass || newPass.length < 4) {
      toast.error(t.newPassMinLength);
      setLoading(false);
      return;
    }
    if (newPass !== confirmNewPass) {
      toast.error(t.newPassNoMatch);
      setLoading(false);
      return;
    }
    // Update passcode in Firestore
    await setDoc(doc(db, "settings", "coachPasscode"), { value: newPass });
    toast.success(t.passChanged);
    setShowChangePasscode(false);
    setCurrentPass(""); setNewPass(""); setConfirmNewPass(""); setAdminPass("");
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    const storedPasscode = await fetchPasscode();
    if (passcode === storedPasscode) {
      localStorage.setItem("isAuthenticated", "true");
      onAuthenticate();
      toast.success(t.loginSuccess);
      navigate("/patients");
    } else {
      setError(t.invalidPasscode);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-8 flex flex-col bg-white shadow-lg rounded-lg w-96">
        <img src="/Logo.png" alt="" className="flex m-auto w-[200px]" />
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">{t.welcomeBack}</h1>
        <p className="text-center text-gray-600 mb-4">{t.enterPasscodeToContinue}</p>
        {!showChangePasscode && (
          <>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder={t.enterYourPasscode}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c3435] focus:outline-none mb-4 text-gray-700"
              disabled={loading}
            />
            {error && <p className="text-red-500 text-sm mb-4 text-center">{t.invalidPasscode}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-[#2f6e44] text-white py-3 rounded-lg hover:bg-[#a9d15e] focus:outline-none focus:ring-2 focus:ring-[#9c3435] focus:ring-offset-2 transition duration-200 mb-2"
              disabled={loading}
            >
              {loading ? t.loading : t.login}
            </button>
          </>
        )}
        <button
          onClick={() => setShowChangePasscode((v) => !v)}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9c3435] focus:ring-offset-2 transition duration-200 mb-2"
        >
          {showChangePasscode ? t.cancel : t.changePasscode}
        </button>
        {showChangePasscode && (
          <form onSubmit={handleChangePasscode} className="mt-4 flex flex-col space-y-3">
            <input
              type="password"
              value={adminPass}
              onChange={e => setAdminPass(e.target.value)}
              placeholder={t.adminPasscode}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c3435] focus:outline-none"
              disabled={loading}
            />
            <input
              type="password"
              value={currentPass}
              onChange={e => setCurrentPass(e.target.value)}
              placeholder={t.currentPasscode}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c3435] focus:outline-none"
              disabled={loading}
            />
            <input
              type="password"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder={t.newPasscode}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c3435] focus:outline-none"
              disabled={loading}
            />
            <input
              type="password"
              value={confirmNewPass}
              onChange={e => setConfirmNewPass(e.target.value)}
              placeholder={t.confirmNewPasscode}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9c3435] focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
              disabled={loading}
            >
              {loading ? t.saving : t.saveNewPasscode}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
