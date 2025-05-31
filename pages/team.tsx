import { NextPage } from 'next'
import Link from 'next/link'
import TestComponent from '../components/TestComponent'

const Team: NextPage = () => (
  <main>
    <h1>About Us</h1>
    <p>This is the About page.</p>
    <TestComponent />
  </main>
)

export default Team
