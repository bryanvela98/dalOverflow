import { useNavigate } from "react-router-dom";
import "./BackButton.css";

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button className="back-button" onClick={() => navigate(-1)}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>Back</span>
    </button>
  );
};

export default BackButton;
