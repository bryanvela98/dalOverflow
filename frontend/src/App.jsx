import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreateQuestion from "./components/Question/CreateQuestion";
import Tags from "./components/Tags/Tags";
import LoginRegistration from "./pages/LoginRegistration";
import ProtectedRoute from "./routes/ProtectedRoute";
import BasicQuestionDetail from "./components/Question/BasicQuestionDetail"; // Add this import

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
        <Route path="/questions/:id" element={<BasicQuestionDetail />} />
        <Route path="/tags" element={<Tags />} />
        <Route path="/login" element={<LoginRegistration />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
