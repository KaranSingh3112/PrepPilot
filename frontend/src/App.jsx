import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const History = lazy(() => import('./pages/History'))
const Upload = lazy(() => import('./pages/Upload'))
const Interview = lazy(() => import('./pages/Interview'))
const Report = lazy(() => import('./pages/Report'))

function App() {
  return(
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path='/login' element={ <Login /> } />
          <Route path='/' element={ <Home /> } />
          <Route path='/dashboard' element={ <ProtectedRoute><Dashboard /></ProtectedRoute> } />
          <Route path='/history' element={ <ProtectedRoute><History /></ProtectedRoute> } />
          <Route path='/upload' element={ <ProtectedRoute><Upload /></ProtectedRoute> } />
          <Route path='/interview/:id' element={ <ProtectedRoute><Interview /></ProtectedRoute> }/>
          <Route path='/report/:id' element={ <ProtectedRoute><Report /></ProtectedRoute> } />
          <Route path='*' element={ <h1>404 Not Found</h1> } />
        </Routes>
      </Suspense>
   </AuthProvider> 
  );
}

export default App
