import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Upload from './pages/Upload'
import Interview from './pages/Interview'
import Report from './pages/Report'
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return(
    <AuthProvider>
      <Routes>
        <Route path='/login' element={ <Login /> } />
        <Route path='/' element={ <Home /> } />
        <Route path='/dashboard' element={ <ProtectedRoute><Dashboard /></ProtectedRoute> } />
        <Route path='/history' element={ <ProtectedRoute><History /></ProtectedRoute> } />
        <Route path='/upload' element={ <ProtectedRoute><Upload /></ProtectedRoute> } />
        <Route path='/interview/:id' element={ <ProtectedRoute><Interview /></ProtectedRoute> }/>
        <Route path='/report/:id' element={ <ProtectedRoute><Report /></ProtectedRoute> } />
      </Routes>
   </AuthProvider> 
  );
}

export default App
