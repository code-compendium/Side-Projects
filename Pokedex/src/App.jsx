import { BrowserRouter, Routes, Route } from "react-router-dom";

import PokemonPage from "./pages/PokemonPage";
import LocationsPage from "./pages/LocationsPage";
import Navbar from "./components/NavBar/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<PokemonPage />} />
        <Route path="/locations" element={<LocationsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
