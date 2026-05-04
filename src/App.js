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
import CreateProjectPage from "./components/CreateProjectPage";
import EditProjectPage from "./components/EditProjectPage";
import ProjectDetailsPage from "./components/ProjectDetailsPage";
import Calculator from "./components/Calculator";
import Blog from "./components/Blog";
import BlogArticlePage from "./components/BlogArticlePage";
import CreateArticlePage from "./components/CreateArticlePage";
import EditArticlePage from "./components/EditArticlePage";
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

const CreateProjectPageWrapper = () => (
  <>
    <Navbar />
    <CreateProjectPage />
  </>
);

const EditProjectPageWrapper = () => (
  <>
    <Navbar />
    <EditProjectPage />
  </>
);

const ProjectDetailsPageWrapper = () => (
  <>
    <Navbar />
    <ProjectDetailsPage />
  </>
);

const CalculatorPage = () => (
  <>
    <Navbar />
    <Calculator />
  </>
);

const BlogPage = () => (
  <>
    <Navbar />
    <Blog />
  </>
);

const BlogArticlePageWrapper = () => (
  <>
    <Navbar />
    <BlogArticlePage />
  </>
);

const CreateArticlePageWrapper = () => (
  <>
    <Navbar />
    <CreateArticlePage />
  </>
);

const EditArticlePageWrapper = () => (
  <>
    <Navbar />
    <EditArticlePage />
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
      <Route
        path="/create-project"
        element={
          <PrivateRoute>
            <CreateProjectPageWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit-project/:id"
        element={
          <PrivateRoute>
            <EditProjectPageWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="/project/:id"
        element={
          <PrivateRoute>
            <ProjectDetailsPageWrapper />
          </PrivateRoute>
        }
      />
      <Route path="/calculator" element={<CalculatorPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:id" element={<BlogArticlePageWrapper />} />
      <Route
        path="/create-article"
        element={
          <PrivateRoute>
            <CreateArticlePageWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit-article/:id"
        element={
          <PrivateRoute>
            <EditArticlePageWrapper />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
