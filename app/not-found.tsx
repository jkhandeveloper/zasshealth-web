import Link from 'next/link';
import {Brand} from './ui/components';
export default function NotFound(){return <main className="logout-page"><section className="logout-card"><Brand/><div className="logout-symbol">404</div><span className="logout-eyebrow">LET’S GET YOU BACK</span><h1>Page not found.</h1><p>This address isn’t part of your workspace. Return to sign in and continue from there.</p><Link href="/login/" className="btn">Back to clinic login →</Link><Link href="/admin/login/" className="logout-other">Open Super Admin login</Link></section></main>}
