import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Usuarios from './pages/Usuarios'
import Livros from './pages/Livros'
import Emprestimos from './pages/Emprestimos'
import Reservas from './pages/Reservas'
import Multas from './pages/Multas'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            toastClassName="dark:bg-gray-800 dark:text-white"
          />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="livros" element={<Livros />} />
              <Route path="emprestimos" element={<Emprestimos />} />
              <Route path="reservas" element={<Reservas />} />
              <Route path="multas" element={<Multas />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App