"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-black border-b border-gray">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-semibold whitespace-nowrap">Anthropos City</span>
        </Link>
        <div className="flex md:order-2 space-x-3 md:space-x-0">
          <button
            type="button"
            className=" flex items-center justify-center gap-2 text-black bg-main/90 hover:bg-main font-medium rounded-lg px-4 py-2 text-center"
          >
            Log In
            <Image src="" alt="Logo" width={24} height={24} className="bg-black w-6 h-6 object-contain" />
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-dim_smoke rounded-lg md:hidden hover:bg-white/10"
            aria-controls="navbar-cta"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="w-8 h-8" aria-hidden="true" />
          </button>
        </div>
        <div
          className={`items-center justify-between ${isMenuOpen ? "block" : "hidden"} w-full md:flex md:w-auto md:order-1`}
          id="navbar-cta"
        >
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray rounded-lg bg-foreground md:bg-transparent md:space-x-4 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 ">
            <li>
              <Link
                href="/about"
                className=" block py-2 px-3 md:px-3 md:px-2 text-dim_smoke rounded-sm hover:bg-white/10 md:hover:text-smoke"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/services"
                className=" block py-2 px-3 md:px-3 md:px-2 text-dim_smoke rounded-sm hover:bg-white/10 md:hover:text-smoke"
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className=" block py-2 px-3 md:px-3 md:px-2 text-dim_smoke rounded-sm hover:bg-white/10 md:hover:text-smoke"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
