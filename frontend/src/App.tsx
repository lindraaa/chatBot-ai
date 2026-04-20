import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { luxuryHotelTheme } from './theme/theme';
import { LandingPage } from './pages/LandingPage';
import { UserChat } from './pages/UserChat';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <ThemeProvider theme={luxuryHotelTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<UserChat />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
