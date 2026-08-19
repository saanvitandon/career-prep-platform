import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import ResumeMatcher from "./pages/ResumeMatcher";
import InterviewPrep from "./pages/InterviewPrep";
import Roadmap from "./pages/Roadmap";
import PDFAssistant from "./pages/PDFAssistant";
import Settings from "./pages/Settings";

import Layout from "./components/layout/Layout";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>

        <Routes>

          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          {/* App pages */}
          <Route element={<Layout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/resume-analyzer"
              element={<ResumeAnalyzer />}
            />

            <Route
              path="/resume-matcher"
              element={<ResumeMatcher />}
            />

            <Route
              path="/interview-prep"
              element={<InterviewPrep />}
            />

            <Route
              path="/roadmap"
              element={<Roadmap />}
            />

            <Route
              path="/pdf-assistant"
              element={<PDFAssistant />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

          </Route>

        </Routes>

      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;