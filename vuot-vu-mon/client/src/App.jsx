import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GameMap from './pages/GameMap';
import QuestionView from './pages/QuestionView';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import AdminRoute from './components/AdminRoute';
import GuestRoute from './components/GuestRoute';
import Dashboard from './pages/admin/Dashboard';
import QuestionBank from './pages/admin/QuestionBank';
import QuestionForm from './pages/admin/QuestionForm';
import UserManagement from './pages/admin/UserManagement';
import GameLatTheTriNho from './pages/GameMap/Grade3/GameLatTheTriNho';
import BangCuuChuong1 from './pages/GameMap/Grade3/BangCuuChuong1';
import ThuThachKhoiDau from './pages/GameMap/Grade3/ThuThachKhoiDau';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Đang tải...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Guest Routes - Tự động tạo guest user + Sidebar */}
            <Route
              path="/"
              element={
                <GuestRoute>
                  <Layout>
                    <GameMap />
                  </Layout>
                </GuestRoute>
              }
            />

            <Route
              path="/game-map"
              element={
                <GuestRoute>
                  <Layout>
                    <GameMap />
                  </Layout>
                </GuestRoute>
              }
            />

            <Route
              path="/game/play"
              element={
                <GuestRoute>
                  <Layout>
                    <QuestionView />
                  </Layout>
                </GuestRoute>
              }
            />

            <Route
              path="/game/grade3/game-lat-the-tri-nho"
              element={
                <GuestRoute>
                  <Layout>
                    <GameLatTheTriNho />
                  </Layout>
                </GuestRoute>
              }
            />

            <Route
              path="/game/grade3/bang-cuu-chuong"
              element={
                <GuestRoute>
                  <Layout>
                    <BangCuuChuong1 />
                  </Layout>
                </GuestRoute>
              }
            />

            <Route
              path="/game/grade3/thu-thach-khoi-dau"
              element={
                <GuestRoute>
                  <Layout>
                    <ThuThachKhoiDau />
                  </Layout>
                </GuestRoute>
              }
            />

            {/* Protected Routes - Cần đăng ký + Sidebar */}

            <Route
              path="/shop"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Shop />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/question-bank"
              element={
                <AdminRoute>
                  <QuestionBank />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/question-bank/create"
              element={
                <AdminRoute>
                  <QuestionForm />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/question-bank/edit/:id"
              element={
                <AdminRoute>
                  <QuestionForm />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
