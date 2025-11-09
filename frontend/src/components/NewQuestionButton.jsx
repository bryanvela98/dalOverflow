import { useState } from "react";
import "../styles/newQuestionButton.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function NewQuestionButton() {
  const navigate = useNavigate();
  const isLoggedIn = useAuth();

  const buttonClick = () => {
    if (!isLoggedIn) {
      alert("Please log in to ask a question");
      navigate("/login");
    } else {
      navigate("/ask");
    }
  };

  return (
    <div>
      <button onClick={() => buttonClick()}>New Question</button>
    </div>
  );
}
