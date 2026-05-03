import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CatalogSection from "./components/CatalogSection";
import FeaturesSection from "./components/FeaturesSection";
import BlogSection from "./components/BlogSection";
import QuizSection from "./components/QuizSection";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import VerifyEmailForm from "./components/VerifyEmailForm";
import Dashboard from "./components/Dashboard";
import Catalog from "./components/Catalog";
import InstrumentDetails from "./components/InstrumentDetails";
import PrivateRoute from "./components/PrivateRoute";

const HomePage = () => (
  <div className="App">
    <Navbar />
    <Hero />
    <CatalogSection />
    <FeaturesSection />
    <BlogSection />
    <QuizSection />
    <CtaSection />
    <Footer />
  </div>
);

const CatalogPage = () => (
  <>
    <Navbar />
    <Catalog />
  </>
);

const InstrumentDetailsPage = () => (
  <>
    <Navbar />
    <InstrumentDetails />
  </>
);

const DashboardPage = () => (
  <>
    <Navbar />
    <Dashboard />
  </>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/verify-email" element={<VerifyEmailForm />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/instrument/:id" element={<InstrumentDetailsPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
