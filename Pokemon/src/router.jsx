import { createBrowserRouter } from "react-router";
import RootLayout from "./components/RootLayout";
import HomePage from "./pages/HomePage";
import PokemonDetailPage from "./pages/PokemonDetailPage";
import BerriesPage from "./pages/BerriesPage";
import BerryDetailPage from "./pages/BerryDetailPage";
import LocationsPage from "./pages/LocationsPage";
import LocationDetailPage from "./pages/LocationDetailPage";
import { homeLoader } from "./pages/HomePage.loader";
import { detailLoader } from "./pages/DetailPage.loader";
import { berriesLoader } from "./pages/BerriesPage.loader";
import { berryDetailLoader } from "./pages/BerryDetailPage.loader";
import { locationsLoader } from "./pages/LocationsPage.loader";
import { locationDetailLoader } from "./pages/LocationDetailPage.loader";
import RouteErrorBoundary from "./components/RouteErrorBoundary";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/",
        Component: HomePage,
        loader: homeLoader,
        HydrateFallback: () => <div>Loading...</div>,
      },
      {
        path: "/pokemon/:id",
        Component: PokemonDetailPage,
        loader: detailLoader,
        HydrateFallback: () => <div>Loading pokemon details...</div>,
      },
      {
        path: "/berries",
        Component: BerriesPage,
        loader: berriesLoader,
        HydrateFallback: () => <div>Loading berries...</div>,
      },
      {
        path: "/berries/:id",
        Component: BerryDetailPage,
        loader: berryDetailLoader,
        HydrateFallback: () => <div>Loading berry details...</div>,
      },
      {
        path: "/locations",
        Component: LocationsPage,
        loader: locationsLoader,
        HydrateFallback: () => <div>Loading locations...</div>,
      },
      {
        path: "/locations/:id",
        Component: LocationDetailPage,
        loader: locationDetailLoader,
        HydrateFallback: () => <div>Loading location details...</div>,
      },
    ],
  },
]);
