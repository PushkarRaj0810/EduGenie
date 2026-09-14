
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Layout
import AppLayout from "./layouts/AppLayout";

// Public Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Application Pages
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Tutor from "./pages/Tutor";
import Quiz from "./pages/Quiz";
import Flashcards from "./pages/Flashcards";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";


/*
|--------------------------------------------------------------------------
| Protected Layout
|--------------------------------------------------------------------------
| All application pages share the same EduGenie dashboard layout.
| Authentication can be added here later when we connect the backend.
|--------------------------------------------------------------------------
*/

function ProtectedLayout({ children }) {
  return <AppLayout>{children}</AppLayout>;
}


/*
|--------------------------------------------------------------------------
| Application Router
|--------------------------------------------------------------------------
*/

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================================================
            PUBLIC ROUTES
        ========================================================= */}

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* =========================================================
            APPLICATION ROUTES
        ========================================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedLayout>
              <Documents />
            </ProtectedLayout>
          }
        />

        <Route
          path="/tutor"
          element={
            <ProtectedLayout>
              <Tutor />
            </ProtectedLayout>
          }
        />

        <Route
          path="/quiz"
          element={
            <ProtectedLayout>
              <Quiz />
            </ProtectedLayout>
          }
        />

        <Route
          path="/flashcards"
          element={
            <ProtectedLayout>
              <Flashcards />
            </ProtectedLayout>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedLayout>
              <Analytics />
            </ProtectedLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedLayout>
              <Settings />
            </ProtectedLayout>
          }
        />


        {/* =========================================================
            FALLBACK ROUTE
        ========================================================= */}

        <Route
          path="*"
          element={<Landing />}
        />

      </Routes>
    </BrowserRouter>
  );
}
