'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {Brand,Icon} from './components';
import {SESSION_KEY} from './useDemoSession';
export default function PatientLogout(){
 const [done,setDone]=useState(false),[failed,setFailed]=useState(false);
 useEffect(()=>{try{sessionStorage.removeItem(SESSION_KEY);setDone(true)}catch{setFailed(true)}},[]);
 return <main className="logout-page"><section className="logout-card"><Brand/><div className="logout-symbol"><Icon name="logout"/></div><span className="logout-eyebrow">PATIENT WORKSPACE</span><h1>{failed?'Unable to clear session':done?'You’re signed out.':'Signing you out…'}</h1><p>{failed?'Please close this browser tab to end your demo session.':'Your patient demo session has ended. Your registered account remains available in this browser.'}</p><Link className="btn" href="/patient/login/">Back to patient login →</Link><Link className="logout-other" href="/login/">Doctor / Clinic login</Link><div className="logout-footnote">Frontend demonstration · Use fictional information only</div></section></main>;
}
