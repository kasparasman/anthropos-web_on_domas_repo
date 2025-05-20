'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import styles from './Navbar.module.css'
import ProfileButton from '../components/ProfileButton'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const path = usePathname()

  const links = [
    { href: '/about',    label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/contact',  label: 'Contact' },
    { href: '/team',     label: 'Team' },
  ]

  return (
    <nav className="bg-black border-b border-gray">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-semibold whitespace-nowrap">
            Anthropos City
          </span>
        </Link>

        {/* Desktop profile & mobile hamburger */}
        <div className="flex md:order-2 space-x-3 md:space-x-0">
          {/* show ProfileButton on md+ */}
          <div className="hidden md:flex">
            <ProfileButton />
          </div>
          {/* hamburger */}
          <button
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-dim_smoke rounded-lg md:hidden hover:bg-white/10"
            aria-controls="navbar-cta"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="w-8 h-8" aria-hidden="true" />
          </button>
        </div>

        {/* links + mobile menu */}
        <div
          className={`items-center justify-between ${isMenuOpen ? 'block' : 'hidden'} w-full md:flex md:w-auto md:order-1`}
          id="navbar-cta"
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray rounded-lg bg-foreground md:bg-transparent md:space-x-4 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`block py-2 px-3 md:px-2 text-dim_smoke rounded-sm hover:bg-white/10 md:hover:text-smoke ${
                    path === href ? styles.activeLink : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}

            {/* ProfileButton in mobile nav */}
            <li className="md:hidden">
              <ProfileButton />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}