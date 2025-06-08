import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black text-gray-300 py-6 border-t border-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm">
        <div className="mb-4 md:mb-0">
          <p>&copy; {currentYear} Anthropos City. All rights reserved.</p>
        </div>
        <nav className="flex space-x-4">
          <Link href="/privacy-policy" className="hover:text-white transition-colors duration-200">
            Privacy Policy
          </Link>
          <Link href="/cookie-policy" className="hover:text-white transition-colors duration-200">
            Cookie Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-white transition-colors duration-200">
            Terms of Service
          </Link>
          <Link href="/dpa" className="hover:text-white transition-colors duration-200">
            DPA
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer; 