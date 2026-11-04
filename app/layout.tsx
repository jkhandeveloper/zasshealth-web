import type { Metadata } from 'next';
import './globals.css';
import './enhancements.css';
import './auth.css';
import './professional.css';
import './responsive.css';
import './reference-design.css';
import './reference-details.css';
import './fullscreen.css';
import './patient.css';
export const metadata: Metadata = { title: 'Zass Health — Connected care workspace', description: 'Doctor, clinic and healthcare administration frontend workspace.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
