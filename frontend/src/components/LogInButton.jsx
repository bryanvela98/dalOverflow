import "../styles/newQuestionButton.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function NewQuestionButton() {
  const navigate = useNavigate();
  const isLoggedIn = useAuth();

  const login = () => {
    navigate("/login");
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      {!isLoggedIn && <button onClick={login}>Log in</button>}
      {!isLoggedIn && <button onClick={login}>Sign Up</button>}
      {isLoggedIn && <button onClick={logout}>Log out</button>}
    </div>
  );
}
