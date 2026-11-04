import {API_MODE} from '../../ui/api';
import Link from 'next/link';
import LivePortal from '../../ui/LivePortal';
export function generateStaticParams(){return ['login','dashboard','bills','logout'].map(page=>({slug:[page]}))}
export default function Page(){return API_MODE?<LivePortal/>:<div className="loading"><h1>Zass Health</h1><p>Pharmacy billing requires connected API mode. This installation runs as a standalone frontend demo.</p><Link className="btn" href="/login/">Open frontend demo</Link></div>}