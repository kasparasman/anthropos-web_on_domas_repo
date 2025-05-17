'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import styles from './Navbar.module.css'
import ProfileButton from '../components/ProfileButton'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const path = usePathname()

  const links = [
    { href: '/team',  label: 'Team' },
    // The "Log in" link is now redundant because ProfileButton handles auth.
  ]

  return (
    <nav className="bg-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Home */}
        <Link href="/" className="text-2xl font-bold">
          Anthropos City
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center space-x-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`hover:text-blue-600 ${
                path === href ? styles.activeLink : ''
              }`}
            >
              {label}
            </Link>
          ))}

          {/* Profile avatar / sign-in */}
          <ProfileButton />
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setOpen((v) => !v)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white px-4 pb-4 space-y-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block py-2 hover:bg-gray-100 rounded ${
                path === href ? styles.activeLink : ''
              }`}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          {/* Profile button in mobile nav */}
          <ProfileButton />
        </div>
      )}
    </nav>
  )
}
