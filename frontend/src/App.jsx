import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreateQuestion from "./components/Question/CreateQuestion";
import QuestionPage from "./pages/QuestionPage";
import Tags from "./components/Tags/Tags";
import QuestionDetails from "./components/Question/QuestionDetail";
import LoginRegistration from "./pages/LoginRegistration";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/ask"
          element={
            <ProtectedRoute>
              <CreateQuestion />
            </ProtectedRoute>
          }
        />
        <Route path="/questions/:id" element={<QuestionPage />} />
        <Route path="/question/:id" element={<QuestionDetails />} />
        <Route path="/tags" element={<Tags />} />
        <Route path="/login" element={<LoginRegistration />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
