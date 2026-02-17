import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import ProtectedRoute from "../routes/ProtectedRoute";

import AdminDashboard from "../pages/admin/AdminDashboard";
import UserDashboard from "../pages/user/UserDashboard";
import UserCampaignDetails from "../components/userComponents/CampaignDetails";
import AdminCampaignDetails from "../components/adminComponents/CampaignDetails";

function App() {
  const token = localStorage.getItem("token")
  const userData = JSON.parse(localStorage.getItem("user"))
  const role = userData?.role
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            token ? (
              role === "admin" ? (
                <Navigate to="/admin-dashboard" />
              ) : (
                <Navigate to="/user-dashboard" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
        <Route path="campaign/:id" element={<AdminCampaignDetails />} />
        </Route>

        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        >
        <Route path="campaign/:id" element={<UserCampaignDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
