import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CashierPage from './pages/CashierPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/cashier" element={
        <ProtectedRoute allowedRoles={['cashier', 'admin']}>
          <CashierPage />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;