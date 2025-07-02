import './App.css'
import { Routes , Route } from 'react-router-dom'
import useAuthStore from './store/store'
import NewUserLandingPage from './layouts/publicLayout'
import SignIn from './components/modals/signin'
import LoggedInHomePage from './layouts/privateLayout'

function App() {
  const { jwt } = useAuthStore()
  const isAuthenticated = !!jwt
  return (
    <>
      <Routes>
        <Route path='/' element={isAuthenticated ? <LoggedInHomePage /> : <NewUserLandingPage />}/>
      </Routes>
      
    </>
  )
}

export default App
