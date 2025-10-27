import "../styles/newQuestionButton.css";
import { useNavigate } from "react-router-dom";

export default function NewQuestionButton() {
  const navigate = useNavigate();

  const buttonClick = () => {
    navigate("/ask");
  };

  return <button onClick={() => buttonClick()}>New Question</button>;
}
