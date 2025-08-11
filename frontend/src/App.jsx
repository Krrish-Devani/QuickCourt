import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./store/useAuthStore"
import { useEffect } from "react"
import { Loader } from "lucide-react"
import { Toaster } from "react-hot-toast"

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import EmailVerify from "./pages/EmailVerify";
// import AddVenue from "./pages/AddVenue";

function App() {

  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={ !authUser ? <SignUp /> : <Navigate to={"/"} />} />
          <Route path="/login" element={ !authUser ? <Login /> : <Navigate to={"/"} />} />
          <Route path="/verify-email" element={<EmailVerify />} />
          <Route path="/profile" element={ authUser ? <Profile /> : <Navigate to={"/login"} />} />
        </Routes>
      </main>

      <Toaster />

    </div>
  )
}

export default App