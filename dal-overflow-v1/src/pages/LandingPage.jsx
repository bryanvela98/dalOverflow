import React from "react";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import RightBar from "../components/RightBar";
import QuestionTile from "../components/QuestionTile";

import "../styles/LandingPage.css";

export default function LandingPage() {
  return (
    <div className="background-page">
      <p>Hello</p>
      <Header />
      <div className="major-body">
        <Sidebar />
        <div className="main-body">
          <QuestionTile />
          <RightBar />
        </div>
      </div>
    </div>
  );
}
