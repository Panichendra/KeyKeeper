import { useEffect, useRef, useState } from 'react'

import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { v4 as uuidv4 } from 'uuid';

const Manager = ({ apiBase, user, onAuthSuccess }) => {


  const ref = useRef(); // to toggle the eye logo
  const passref = useRef(); // to toogle between password visibility
  const [form, setForm] = useState({ site: "", username: "", password: "" }); // to handle the form changes
  const [passArray, setpassArray] = useState([]); // array which has the passwords that are saved in local storage/database
  const [showPasswords, setShowPasswords] = useState({});
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authLoading, setAuthLoading] = useState(false)

  const getPasswords = async () => {
    if (!user) {
      setpassArray([])
      return
    }

    const req = await fetch(`${apiBase}/`, {
      credentials: 'include'
    })

    const passwords = await req.json()

    if (passwords) {
      console.log(passwords)
      setpassArray(passwords)
    }
  }

  useEffect(() => {
    // useEfect is used so that when ever there is change in the passwords re-render occurs and the functions in it are called
    getPasswords()
  }, [user, apiBase])


  const show = () => {



    if (ref.current.src.includes("hide.png")) {
      ref.current.src = "./view.png";
      passref.current.type = "password";
    }
    else {
      ref.current.src = "./hide.png";
      passref.current.type = "text";
    }


  }

  const savePassword = async () => {
    console.log(form)
    // now pushing the created form from input to passArray
    if (!user) {
      toast('Please sign in to save passwords.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      })
      return
    }
    if (form.site.length < 3 || form.username.length < 3 || form.password.length < 3) {  
      toast('Enter Valid Form values!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }
    else {
      const id = uuidv4();  
      const updatedArray = [...passArray, { ...form, id }]; 
      setpassArray(updatedArray);

      let res = await fetch(`${apiBase}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ ...form, id })
      })

      setForm({ site: "", username: "", password: "" })  

      toast('Password Saved!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }
  }

  const editPassword = async (id) => {
    console.log(id)
    // this will select the id and put them in the form input
    setForm(passArray.filter(item => item.id === id)[0]);

    // now remove the value from the table 
    const updatedArray = passArray.filter((item) => item.id !== id);
    setpassArray(updatedArray);

    // Delete from database
    let res = await fetch(`${apiBase}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include'
    })

    toast('Password loaded for editing!', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
  }

  const delPassword = async (id) => {
    console.log(id)
    const updatedArray = passArray.filter((item) => item.id !== id);
    setpassArray(updatedArray);
    
    let res = await fetch(`${apiBase}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include'
    })

    toast('Password Deleted!', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
  }

  const copyPass = (val) => {

    toast('Copied to clipBoard!', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });

    navigator.clipboard.writeText(val);
  }

  const togglePasswordVisibility = (id) => {  
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    if (authLoading) return

    const trimmedEmail = authForm.email.trim().toLowerCase()
    const trimmedName = authForm.name.trim()
    const trimmedPassword = authForm.password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      toast('Email and password are required.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      })
      return
    }

    if (trimmedPassword.length < 6) {
      toast('Password must be at least 6 characters.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      })
      return
    }

    if (authMode === 'register' && trimmedName.length < 2) {
      toast('Name must be at least 2 characters.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      })
      return
    }

    setAuthLoading(true)

    try {
      const endpoint = authMode === 'login' ? 'login' : 'register'
      const payload = authMode === 'login'
        ? { email: trimmedEmail, password: trimmedPassword }
        : { name: trimmedName, email: trimmedEmail, password: trimmedPassword }

      const res = await fetch(`${apiBase}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      onAuthSuccess(data.user)
      setAuthForm({ name: '', email: '', password: '' })

      toast(authMode === 'login' ? 'Welcome back!' : 'Account created!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      })
    } catch (error) {
      toast(error.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      })
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-8 md:px-14 pt-8">
        <div className="glass-card fade-up rounded-3xl px-6 sm:px-10 py-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <span className="hero-badge">Secure Vault</span>
              <h1 className="display-font text-3xl sm:text-4xl lg:text-5xl text-slate-900">KeyKeeper Vault</h1>
              <p className="text-sm sm:text-base text-slate-500 max-w-xl">
                Store credentials with a clean, calm interface. One place to capture, review, and copy
                your most-used logins.
              </p>
              {user && (
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                    Signed in as {user.email}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-2">Quick save</span>
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-2">Instant copy</span>
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-2">Smooth edit</span>
            </div>
          </div>
        </div>
      </section>

      {!user && (
        <section className="mx-auto max-w-7xl px-4 sm:px-8 md:px-14 mt-6">
          <div className="glass-card fade-up rounded-3xl px-6 sm:px-10 py-8">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-3">
                <h2 className="display-font text-2xl sm:text-3xl text-slate-900">Sign in to your vault</h2>
                <p className="text-sm sm:text-base text-slate-500">
                  Create a KeyKeeper account or log in to access your saved passwords.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${authMode === 'login'
                      ? 'bg-emerald-500 text-white'
                      : 'border border-slate-200 bg-white/70 text-slate-600'}`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${authMode === 'register'
                      ? 'bg-emerald-500 text-white'
                      : 'border border-slate-200 bg-white/70 text-slate-600'}`}
                  >
                    Register
                  </button>
                </div>
              </div>
              <form onSubmit={handleAuthSubmit} className="grid gap-4">
                {authMode === 'register' && (
                  <input
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="input-field w-full text-sm sm:text-base"
                    type="text"
                    placeholder="Full name"
                  />
                )}
                <input
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="input-field w-full text-sm sm:text-base"
                  type="email"
                  placeholder="Email address"
                />
                <input
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="input-field w-full text-sm sm:text-base"
                  type="password"
                  placeholder="Password"
                />
                <button type="submit" className="btn-primary w-full justify-center" disabled={authLoading}>
                  {authLoading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Create account'}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {user && (
        <>
          <section className="mx-auto max-w-7xl px-4 sm:px-8 md:px-14 mt-6">
            <div className="glass-card fade-up rounded-3xl px-6 sm:px-10 py-6 sm:py-8">
              <div className="grid gap-4">
                <input
                  value={form.site}
                  onChange={(e) => { setForm({ ...form, site: e.target.value }) }}
                  className="input-field w-full text-sm sm:text-base"
                  type="text"
                  placeholder="Enter website URL"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={form.username}
                    onChange={(e) => { setForm({ ...form, username: e.target.value }) }}
                    className="input-field w-full text-sm sm:text-base"
                    type="text"
                    placeholder="Enter user name"
                  />
                  <div className="relative">
                    <input
                      ref={passref}
                      value={form.password}
                      onChange={(e) => { setForm({ ...form, password: e.target.value }) }}
                      className="input-field w-full pr-12 text-sm sm:text-base"
                      type="password"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={show}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-emerald-600 transition hover:scale-110"
                    >
                      <img ref={ref} className="w-5 sm:w-6" src="./view.png" alt="toggle" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-center sm:justify-end">
                  <button onClick={savePassword} className="btn-primary">
                    <lord-icon src="https://cdn.lordicon.com/gzqofmcx.json" trigger="hover"></lord-icon>
                    Save password
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 sm:px-8 md:px-14 mt-6 pb-10">
            <div className="glass-card fade-up rounded-3xl px-4 sm:px-8 py-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
                <h2 className="display-font text-xl sm:text-2xl text-slate-800">Your Passwords</h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {passArray.length} items
                </span>
              </div>
              {passArray.length === 0 && (
                <div className="text-center text-slate-500 py-6 text-sm sm:text-base">No passwords saved yet</div>
              )}
              {passArray.length !== 0 && (
                <div className="overflow-x-auto">
                  <table className="table-shell table-fixed w-full overflow-hidden rounded-2xl bg-white/90 text-sm sm:text-base">
                    <thead className="text-white">
                      <tr>
                        <th className="py-3 px-3 sm:px-4 text-left w-1/4">Website</th>
                        <th className="py-3 px-3 sm:px-4 text-left w-1/4">Username</th>
                        <th className="py-3 px-3 sm:px-4 text-left w-1/4">Password</th>
                        <th className="py-3 px-3 sm:px-4 text-left w-1/4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {passArray.map((item) => {
                        return (
                          <tr key={item.id} className="row-hover border-b border-slate-100">
                            <td className="py-3 px-3 sm:px-4">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-emerald-600 max-w-full overflow-x-auto scrollbar-hide">
                                  <a href={item.site} target="_blank" rel="noreferrer" className="whitespace-nowrap text-xs sm:text-base">
                                    {item.site}
                                  </a>
                                </div>
                                <img
                                  onClick={() => { copyPass(item.site) }}
                                  className="w-3 sm:w-4 cursor-pointer shrink-0 transition-transform hover:scale-110"
                                  src="./copy.png"
                                  alt="copy"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-4">
                              <div className="flex items-center justify-between gap-2">
                                <div className="max-w-full overflow-x-auto scrollbar-hide text-xs sm:text-base">
                                  {item.username}
                                </div>
                                <img
                                  onClick={() => { copyPass(item.username) }}
                                  className="w-3 sm:w-4 cursor-pointer shrink-0 transition-transform hover:scale-110"
                                  src="./copy.png"
                                  alt="copy"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-4">
                              <div className="flex items-center justify-between gap-2">
                                <div className="max-w-full overflow-x-auto scrollbar-hide whitespace-nowrap text-xs sm:text-base">
                                  {showPasswords[item.id] ? item.password : "•".repeat(item.password.length)}
                                </div>
                                <img
                                  onClick={() => { copyPass(item.password) }}
                                  className="w-3 sm:w-4 cursor-pointer shrink-0 transition-transform hover:scale-110"
                                  src="./copy.png"
                                  alt="copy"
                                />
                                <img
                                  onClick={() => { togglePasswordVisibility(item.id) }}
                                  className="w-3 sm:w-4 cursor-pointer shrink-0 transition-transform hover:scale-110"
                                  src={showPasswords[item.id] ? "./hide.png" : "./view.png"}
                                  alt="toggle"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-4">
                              <div className="flex gap-3 sm:gap-5">
                                <button onClick={() => { editPassword(item.id) }} className="text-emerald-600 hover:text-emerald-800">
                                  <lord-icon src="https://cdn.lordicon.com/hqymfzvj.json" trigger="hover" style={{ width: "20px", height: "20px" }}></lord-icon>
                                </button>
                                <button onClick={() => { delPassword(item.id) }} className="text-rose-600 hover:text-rose-800">
                                  <lord-icon src="https://cdn.lordicon.com/wpyrrmcq.json" trigger="hover" style={{ width: "20px", height: "20px" }}></lord-icon>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}

    </>
  )
}

export default Manager
