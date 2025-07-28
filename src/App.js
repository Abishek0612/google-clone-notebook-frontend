import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/UI/ErrorBoundary";
import Loading from "./components/UI/Loading";

const Home = React.lazy(() => import("./pages/Home"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="App min-h-screen bg-gray-50">
          <Suspense
            fallback={<Loading size="lg" text="Loading application..." />}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard/:pdfId" element={<Dashboard />} />
            </Routes>
          </Suspense>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
                fontSize: "14px",
              },
              success: {
                style: {
                  background: "#10b981",
                },
              },
              error: {
                style: {
                  background: "#ef4444",
                },
              },
            }}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
