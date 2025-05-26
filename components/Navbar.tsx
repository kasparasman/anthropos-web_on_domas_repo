'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

import ProfileButton from '../components/ProfileButton'
import AuthButton     from './auth/AuthButton'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const path  = usePathname()
  const { data: session } = useSession()

  const links = [
    { href: '/about',    label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/contact',  label: 'Contact' },
    { href: '/team',     label: 'Team' },
  ]

  return (
    <nav className="bg-black border-b border-gray">
      <div className="relative max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-semibold whitespace-nowrap">
            Anthropos City
          </span>
        </Link>

        {/* Desktop profile / auth + hamburger */}
        <div className="flex md:order-2 space-x-3 md:space-x-0">
          {/* Desktop auth/avatar */}
          <div className="hidden md:flex">
            {session?.user ? <ProfileButton /> : <AuthButton />}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
            aria-controls="navbar-cta"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="w-8 h-8" />
          </button>
        </div>

        {/* Links + mobile menu */}
        <div
          id="navbar-cta"
          className={`items-center w-full md:flex md:w-auto md:order-1 ${
            isMenuOpen ? 'block' : 'hidden'
          }`}
        >
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray rounded-lg bg-foreground md:bg-transparent md:space-x-4 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:absolute md:left-1/2 md:-translate-x-1/2">
            {links.map(({ href, label }) => (
              <li key={href}>
              <Link
                href={href}
                className={`block py-2 px-3 md:px-2 rounded-sm hover:bg-white/10 md:hover:text-smoke ${
                path === href ? styles.activeLink : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
              </li>
            ))}

            {/* Mobile auth/avatar */}
            <li className="md:hidden ml-3">
              {session?.user ? <ProfileButton /> : <AuthButton />}
            </li>
            </ul>
        </div>
      </div>
    </nav>
  )
}
