import { useState } from "react";
import Login from "../components/UserRegistrationLogin/Login";
import UserRegistration from "../components/UserRegistrationLogin/UserRegistration";
import "../styles/LoginRegistration.css"; // for styling
import { useNavigate } from "react-router-dom";

export default function LoginRegistration() {
  const [activeForm, setActiveForm] = useState("login"); // "login" or "register"
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="toggle-buttons">
        <button
          className={activeForm === "login" ? "active" : ""}
          onClick={() => setActiveForm("login")}
        >
          Login
        </button>
        <button
          className={activeForm === "register" ? "active" : ""}
          onClick={() => setActiveForm("register")}
        >
          Register
        </button>
      </div>
      <div className="form-container">
        {activeForm === "login" ? <Login /> : <UserRegistration />}
      </div>
    </div>
  );
}
