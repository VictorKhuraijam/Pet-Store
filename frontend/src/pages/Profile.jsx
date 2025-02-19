import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {toast} from 'react-toastify'
import axios from "axios";
import Orders from "./Orders";
import { resetUser, setUser } from "../store/userSlice";
import { clearCart } from "../store/cartSlice";
import { Eye, EyeOff} from 'lucide-react'

const Profile = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })

  const togglePasswordVisible = (field) => {
    setPasswordVisible((prev) => ({
      ...prev,
      [field]: !prev[field], // Toggle only the clicked field
    }));
  };

  // Form states
  const [formData, setFormData] = useState({
    username: user?.username || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    ("");
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.post(
        `${backendUrl}/users/change-username`,
        { username: formData.username },
        { withCredentials: true }
      );
      console.log("User name update response:", response)
      dispatch(setUser(response.data.data));
      toast.success("Username updated successfully");
    } catch (error) {
      console.error(error)
      toast.error( "Error updating username");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (formData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setIsUpdating(true);
    try {
      await axios.post(
        `${backendUrl}/users/change-password`,
        {
          oldPassword: formData.currentPassword,
          confirmPassword: formData.newPassword,
        },
        { withCredentials: true }
      );
      toast.success("Password updated successfully");
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error)
      toast.error(error.response.data.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`${backendUrl}/users/delete-account`, { withCredentials: true });
      dispatch(clearCart());
      dispatch(resetUser());
      navigate("/login");
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Tab Navigation */}
      <div className="flex flex-row lg:ml-[15%] gap-2 mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === "profile"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === "security"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-700  hover:bg-gray-300"
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === "orders"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-700  hover:bg-gray-300"
          }`}
        >
          Orders
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white md:w-max-[300px]  m-auto shadow-md rounded-lg p-4 sm:p-6">
          <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
          <form onSubmit={handleUpdateUsername} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className=" mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className=" sm:w-auto px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition disabled:bg-gray-400"
            >
              {isUpdating ? "Updating..." : "Update Username"}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-white  shadow-md rounded-lg p-4 sm:p-6">
          <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4 w-full">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              {/* <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
              /> */}
              <div className="relative m-auto w-full">
                <input
                  name="currentPassword"
                  onChange={handleInputChange}
                  value={formData.currentPassword}
                  type={passwordVisible.currentPassword ? "text" : "password"}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => togglePasswordVisible("currentPassword")}
                >
                  {passwordVisible.currentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>


              <div className="relative m-auto w-full">
                <input
                  name="newPassword"
                  onChange={handleInputChange}
                  value={formData.newPassword}
                  type={passwordVisible.newPassword ? "text" : "password"}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => togglePasswordVisible("newPassword")}
                >
                  {passwordVisible.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>


              <div className="relative m-auto w-full">
                <input
                  name="confirmPassword"
                  onChange={handleInputChange}
                  value={formData.confirmPassword}
                  type={passwordVisible.confirmPassword ? "text" : "password"}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => togglePasswordVisible("confirmPassword")}
                >
                  {passwordVisible.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

            </div>
            <div className=" flex justify-evenly gap-1">
              <button
                type="submit"
                disabled={isUpdating}
                className=" sm:w-auto text-sm px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition disabled:bg-gray-400"
              >
                {isUpdating ? "Updating Password..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className=" sm:w-auto text-sm px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:bg-red-400"
              >
                {isDeleting ? "Deleting Account..." : "Delete Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
          <Orders />
        </div>
      )}
    </div>
  );
};

export default Profile;
