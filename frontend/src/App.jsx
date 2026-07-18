import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Upload from './pages/Upload'

function App() {
  return(
    <AuthProvider>
      <Routes>
        <Route path='/login' element={ <Login /> } />
        <Route path='/' element={ <Home /> } />
        <Route path='/dashboard' element={ <Dashboard /> } />
        <Route path='/history' element={ <History /> } />
        <Route path='/upload' element={ <Upload /> } />
      </Routes>
   </AuthProvider> 
  );
}

export default App
