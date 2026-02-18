import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import ProtectedRoute from "../routes/ProtectedRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserDashboard from "../pages/user/UserDashboard";
import UserCampaignDetails from "../components/userComponents/CampaignDetails";
import AdminCampaignDetails from "../components/adminComponents/CampaignDetails";
import AdminCreateUser from "../components/adminComponents/AdminCreateUser";
import AdminCredits from "../components/adminComponents/AdminCredits";
import AdminCreditHistory from "../components/adminComponents/AdminCreditHistory";
import AdminCampaigns from "../components/adminComponents/AdminCampaigns";
import CreateCampaignForm from "../components/userComponents/CreateCampaignForm";
import UserCreditHistory from "../components/userComponents/UserCreditHistory";
import UserCampaignHistory from "../components/userComponents/UserCampaignHistory";
import CampaignDetails from "../components/userComponents/CampaignDetails";

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
              {/* Default redirect */}
              <Route index element={<Navigate to="users" replace />} />

              <Route path="users" element={<AdminCreateUser />} />
              <Route path="credits" element={<AdminCredits />} />
              <Route path="transactions" element={<AdminCreditHistory />} />

              <Route path="campaigns">
                <Route index element={<AdminCampaigns filter="" />} />
                <Route path="pending" element={<AdminCampaigns filter="pending" />} />
                <Route path="rejected" element={<AdminCampaigns filter="rejected" />} />
                <Route path="processing" element={<AdminCampaigns filter="processing" />} />
                <Route path="completed" element={<AdminCampaigns filter="completed" />} />
                <Route path=":id" element={<AdminCampaignDetails /> } />
              </Route>
            </Route>

        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        >
        {/* Default redirect */}
              <Route index element={<Navigate to="campaigns" replace />} />

              <Route path="create" element={<CreateCampaignForm />} />
              <Route path="transactions" element={<UserCreditHistory />} />

              <Route path="campaigns">
                <Route index  element={<UserCampaignHistory />}/>
                <Route path=":id" element={<CampaignDetails /> } />
                </Route>
           </Route>
      </Routes>
    </Router>
  );
}

export default App;
