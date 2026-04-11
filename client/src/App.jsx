import { Outlet, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/navbar.jsx'
import { Footer } from './components/footer.jsx'
import Home from './pages/home.jsx'
import Portfolio from './pages/portfolio.jsx'
import Admin from './pages/admin.jsx'
import Contact from './pages/contact.jsx'
import Reviews from './pages/reviews.jsx'

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/reviews" element={<Reviews />} />
      </Route>
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

export default App
