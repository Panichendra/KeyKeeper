import React from 'react'
import { Key } from 'lucide-react'

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className='w-full pt-5 px-4 sm:px-8 md:px-14'>
      <div className='glass-card fade-up flex items-center justify-between rounded-2xl px-5 sm:px-8 py-3 sm:py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-300 to-sky-400 shadow-sm'>
            <Key className='h-6 w-6 text-emerald-950/70' aria-hidden='true' />
          </div>
          <div className='logo font-bold text-2xl sm:text-3xl tracking-tight display-font'>
            <span className='text-emerald-500'>&lt;</span>
            Key<span className='text-emerald-500'>Keeper</span>
            <span className='text-emerald-500'>/&gt;</span>
          </div>
        </div>
        <ul className='flex flex-wrap gap-3 items-center'>
          {user ? (
            <span className='rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700'>
              Hi, {user.name}
            </span>
          ) : (
            <span className='rounded-full border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600'>
              Not signed in
            </span>
          )}
          {user && (
            <button
              onClick={onLogout}
              className='rounded-full border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
            >
              Log out
            </button>
          )}
          <a
            href="https://www.linkedin.com/in/pani-chendra-48b0442b6"
            target="_blank"
            rel="noopener noreferrer"
            className='flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
          >
            <img className='w-6 h-6' src="/linkedin.png" alt="linkedin" />
            Connect
          </a>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
