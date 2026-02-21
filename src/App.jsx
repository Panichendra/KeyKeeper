import { useEffect, useState } from 'react'
import './App.css'

import Navbar from './components/Navbar'
import Manager from './components/Manager'
import Footer from './components/Footer'

function App() {
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch(`${apiBase}/auth/me`, {
          credentials: 'include'
        })

        if (!res.ok) {
          setUser(null)
          return
        }

        const data = await res.json()
        setUser(data.user)
      } catch (error) {
        setUser(null)
      }
    }

    loadUser()
  }, [apiBase])

  const handleAuthSuccess = (authUser) => {
    setUser(authUser)
  }

  const handleLogout = async () => {
    try {
      await fetch(`${apiBase}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      // Ignore network issues during logout cleanup.
    }
    setUser(null)
  }

  return (
    <div className='app-shell'>
      <div className='bg-orb orb-1' />
      <div className='bg-orb orb-2' />
      <div className='bg-grid' />
      <div className='content-layer'>
        <Navbar user={user} onLogout={handleLogout} />
        <main className='flex-1'>
          <Manager
            apiBase={apiBase}
            user={user}
            onAuthSuccess={handleAuthSuccess}
          />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
