import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Upload from './pages/Upload'
import Interview from './pages/Interview'

function App() {
  return(
    <AuthProvider>
      <Routes>
        <Route path='/login' element={ <Login /> } />
        <Route path='/' element={ <Home /> } />
        <Route path='/dashboard' element={ <Dashboard /> } />
        <Route path='/history' element={ <History /> } />
        <Route path='/upload' element={ <Upload /> } />
        <Route path='/interview/:id' element={ <Interview /> }/>
      </Routes>
   </AuthProvider> 
  );
}

export default App
