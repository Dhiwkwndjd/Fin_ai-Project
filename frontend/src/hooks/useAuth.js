import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";


export default function useAuth() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const logoutFromStore = useAuthStore((state) => state.logout);

  const isAuthenticated = Boolean(accessToken && user);
  const isAdmin = isAuthenticated && user.role === "admin";

  function logout() {
    logoutFromStore();
    navigate("/login");
  }

  return { user, isAuthenticated, isAdmin, logout };
}
