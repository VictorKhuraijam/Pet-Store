import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {  useState } from "react";
import axios from "axios";
import Orders from "./Orders";

const Profile = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  if (loading) return <div className="text-center text-xl">Loading...</div>;

  if (!isAuthenticated)
    return (
      <div className="text-center text-xl mt-10">
        <p>Please log in to view this page.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-blue-600 transition"
        >
          Login
        </button>
      </div>
    );

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`${backendUrl}/users/${user._id}`, { withCredentials: true });
      dispatch({ type: "LOGOUT" }); // Dispatch logout action
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold">Welcome, {user.username}!</h1>
        <p className="text-gray-700">Email: {user.email}</p>
        <button
          onClick={handleDeleteAccount}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Account"}
        </button>
      </div>

      {/* Orders Section */}
      <div className="mt-10">
        <Orders />
      </div>
    </div>
  );
};

export default Profile;
