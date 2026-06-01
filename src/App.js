import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
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
import ProjectsPage from "./components/ProjectsPage";
import Calculator from "./components/Calculator";
import Blog from "./components/Blog";
import BlogArticlePage from "./components/BlogArticlePage";
import CreateArticlePage from "./components/CreateArticlePage";
import EditArticlePage from "./components/EditArticlePage";
import Quizzes from "./components/Quizzes";
import QuizPage from "./components/QuizPage";
import PrivateRoute from "./components/PrivateRoute";
import AdminPanel from "./components/AdminPanel";
import AdminUsers from "./components/AdminUsers";
import AdminArticles from "./components/AdminArticles";
import AdminProjects from "./components/AdminProjects";
import AdminInstruments from "./components/AdminInstruments";
import AdminMaterials from "./components/AdminMaterials";
import AdminInstrumentCategories from "./components/AdminInstrumentCategories";
import AdminQuizzes from "./components/AdminQuizzes";
import AdminInstructions from "./components/AdminInstructions";
import AdminComments from "./components/AdminComments";
import { useAuth } from "./context/AuthContext";

const HomePage = () => {
  const { currentUser } = useAuth();

  if (currentUser?.role === 2) {
    console.log(currentUser.role);
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="App">
      <Navbar />
      <Hero />
      <FeaturesSection />
      <BlogSection />
      <QuizSection />
      <CtaSection />
      <Footer />
    </div>
  );
};

const CatalogPage = () => (
  <>
    <Navbar />
    <Catalog />
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

const QuizzesPageWrapper = () => (
  <>
    <Navbar />
    <Quizzes />
  </>
);

const QuizPageWrapper = () => (
  <>
    <Navbar />
    <QuizPage />
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
      <Route path="/instrument/:id" element={<InstrumentDetails />} />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute>
            <AdminUsers />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/articles"
        element={
          <PrivateRoute>
            <AdminArticles />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <PrivateRoute>
            <AdminProjects />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/instruments"
        element={
          <PrivateRoute>
            <AdminInstruments />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/materials"
        element={
          <PrivateRoute>
            <AdminMaterials />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/quizzes"
        element={
          <PrivateRoute>
            <AdminQuizzes />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/instrument-categories"
        element={
          <PrivateRoute>
            <AdminInstrumentCategories />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/instructions"
        element={
          <PrivateRoute>
            <AdminInstructions />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/comments"
        element={
          <PrivateRoute>
            <AdminComments />
          </PrivateRoute>
        }
      />
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
      <Route path="/project/:id" element={<ProjectDetailsPageWrapper />} />
      <Route path="/projects" element={<ProjectsPage />} />
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
      <Route path="/quizzes" element={<QuizzesPageWrapper />} />
      <Route path="/quiz/:id" element={<QuizPageWrapper />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
