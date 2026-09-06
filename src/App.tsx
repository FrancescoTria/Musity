import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import HomePage from "./pages/HomePage";
import TrackPage from "./pages/TrackPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/track/:trackId" element={<TrackPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
