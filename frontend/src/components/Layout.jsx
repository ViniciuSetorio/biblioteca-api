import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useState } from 'react'
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  Clock, 
  AlertCircle,
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react'

const Layout = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/usuarios', label: 'Usuários', icon: <Users size={20} /> },
    { path: '/livros', label: 'Livros', icon: <BookOpen size={20} /> },
    { path: '/emprestimos', label: 'Empréstimos', icon: <Calendar size={20} /> },
    { path: '/reservas', label: 'Reservas', icon: <Clock size={20} /> },
    { path: '/multas', label: 'Multas', icon: <AlertCircle size={20} /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
      {/* Header Moderno */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg dark:shadow-gray-900/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo e Menu Mobile */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-vue-green to-vue-blue rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                    <BookOpen className="text-white" size={24} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-vue-green to-vue-blue bg-clip-text text-transparent">
                  Bibton
                </span>
              </Link>
            </div>

            {/* Navegação Desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-vue-green dark:hover:text-vue-green transition-all duration-200 group"
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Controles Direita */}
            <div className="flex items-center space-x-4">
              {/* Toggle Tema */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 hover:rotate-180"
                aria-label="Alternar tema"
              >
                {theme === 'light' ? (
                  <Moon className="text-gray-700" size={20} />
                ) : (
                  <Sun className="text-yellow-400" size={20} />
                )}
              </button>

              {/* User Info */}
              {user && (
                <div className="flex items-center space-x-4">
                  <div className="hidden md:block text-right">
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {user.nome}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.cargo}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-vue-green to-vue-blue rounded-full flex items-center justify-center text-white font-bold">
                      {user.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-vue-green transition-all duration-200"
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fadeIn">
          <Outlet />
        </div>
      </main>

      {/* Footer Moderno */}
      <footer className="mt-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-vue-green to-vue-blue rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={16} />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                Bibton
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Sistema de Biblioteca Moderno • Engenharia de Software II
            </p>
            
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  Tema: {theme === 'light' ? 'Claro' : 'Escuro'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout