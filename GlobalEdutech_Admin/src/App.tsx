import './App.css'
import { AuthProvider } from './context/AuthContext'
import AppContent from './components/AppContent'

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  )
}

export default App
