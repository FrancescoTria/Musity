import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import HomePage from "./pages/HomePage";
import TrackPage from "./pages/TrackPage";
import GamePage from "./pages/GamePage";
import ChartsPage from "./pages/ChartsPage";

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/track/:trackId" element={<TrackPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/charts" element={<ChartsPage />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}
