import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Patients from "./pages/Patient";
import Recipe from "./pages/Recipe";
import PatientPrescriptions from "./pages/PatientPrescriptions";
import AllRecipe from "./pages/AllRecipe";
import { ToastContainer } from "react-toastify";
import { LangProvider } from "./langContext";

function PrivateRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <LangProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />

        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex flex-col md:flex-row flex-1">
            <div className="w-full md:w-1/6 bg-gray-200">
              <Sidebar />
            </div>
            <div className="w-full md:w-5/6 bg-white h-full overflow-y-auto">
              <Routes>
                <Route
                  path="/"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                      <Patients />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <Login onAuthenticate={() => setIsAuthenticated(true)} />
                  }
                />
                <Route
                  path="/patients"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                      <Patients />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/patients/:patientId/recipes"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                      <Recipe />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/patients"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                      <Patients />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/patients/:patientId"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                      <PatientPrescriptions />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/recipes"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                      <AllRecipe />
                    </PrivateRoute>
                  }
                />
                {/* Add more routes as needed */}
              </Routes>
            </div>
          </div>
        </div>
      </BrowserRouter>
    </LangProvider>
  );
}

export default App;
