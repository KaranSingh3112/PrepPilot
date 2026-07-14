import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import { AuthProvider } from './context/AuthContext'

function App() {
  return(
    <AuthProvider>
    
      <Routes>

        <Route path='/login' element={ <Login /> } />
        <Route path='/' element={ <Home /> } />
        
      </Routes>
   </AuthProvider> 
  );
}

export default App
