import { NextPage } from 'next'
import Link from 'next/link'

const About: NextPage = () => (
  <main>
    <h1>About Us</h1>
    <p>This is the About page.</p>
    <Link href="/">← Back home</Link>
  </main>
)

export default About
