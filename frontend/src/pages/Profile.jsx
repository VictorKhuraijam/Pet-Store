import { useSelector } from "react-redux";

const Profile = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.user);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <div>Please log in to view this page.</div>;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default Profile
