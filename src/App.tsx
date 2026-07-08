import { Routes, Route } from 'react-router-dom'
import Home from './Home'
import Login from './components/auth/Login'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/criar-conta" element={<Login mode="signup" />} />
    </Routes>
  )
}

export default App
