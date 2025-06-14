import { createContext, useState, } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null); // Add editProduct state

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const currency = '₹'

  //  Check authentication status on page load
  // useEffect(() => {
  //   checkAuthStatus();
  // }, []);

  const loginAdmin = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/users/admin/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        setAdmin(response.data.data);
        setIsAuthenticated(true);
        toast.success("Login successful!");
      } else {

        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const logoutAdmin = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/users/admin/logout`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setAdmin(null);
        setIsAuthenticated(false);
        toast.success("Logged out successfully!");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const checkAuthStatus = async () => {

      try {
        const response = await axios.get(`${backendUrl}/users/admin/check-auth`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setAdmin(response.data.data);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Auth check failed:", error.message);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }

  };

  return (
    <AuthContext.Provider
      value={{ admin, isAuthenticated, loading, backendUrl, currency, loginAdmin, checkAuthStatus, logoutAdmin, editProduct, setEditProduct }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
