  import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreateQuestion from './components/Question/CreateQuestion';
import QuestionDetail from './components/Question/QuestionDetail';
import Tags from './components/Tags/Tags';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/ask" element={<CreateQuestion />} />
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route path="/tags" element={<Tags />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

