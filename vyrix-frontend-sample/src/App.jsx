import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Tutorials from './pages/Tutorials'
import TutorialsNext from './pages/TutorialsNext'
import Home from './pages/Home'
import Editor from './pages/Editor'
import Folder from './pages/Folder'
import AllFiles from './pages/AllFiles'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/tutorials" element={<Tutorials />} />
      <Route path="/tutorials/next" element={<TutorialsNext />} />
      <Route path="/home" element={<Home />} />
      <Route path="/doc/:id" element={<Editor />} />
      <Route path="/folder/:id" element={<Folder />} />
      <Route path="/all-files" element={<AllFiles />} />
      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  )
}
