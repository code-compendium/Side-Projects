import { RouterProvider } from "react-router/dom";
import { ToastContainer } from "react-toastify";
import { router } from "./router";
import { ThemeProvider } from "./hooks/useTheme.jsx";
import { I18nProvider } from "./hooks/useI18n.jsx";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            closeOnClick
            pauseOnHover
            theme="colored"
            newestOnTop
          />
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
