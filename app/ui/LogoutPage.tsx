'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {Brand,Icon} from './components';
import {SESSION_KEY} from './useDemoSession';

export default function LogoutPage({admin=false}:{admin?:boolean}){
 const [done,setDone]=useState(false),[failed,setFailed]=useState(false);
 useEffect(()=>{try{sessionStorage.removeItem(SESSION_KEY);setDone(true)}catch{setFailed(true)}},[]);
 return <main className="logout-page"><div className="logout-card"><Brand/><div className="logout-symbol"><Icon name="logout"/></div><span className="logout-eyebrow">{admin?'ADMIN WORKSPACE':'CLINIC WORKSPACE'}</span><h1>{failed?'Unable to clear session':done?'You’re signed out.':'Signing you out…'}</h1><p>{failed?'Close this browser tab to end your demo session.':'Your demo session has ended. You can sign in again whenever you’re ready.'}</p><Link className="btn" href={admin?'/admin/login/':'/login/'}>Back to {admin?'admin':'doctor'} login →</Link><Link className="logout-other" href={admin?'/login/':'/admin/login/'}>Switch to {admin?'Doctor / Clinic':'Super Admin'}</Link><div className="logout-footnote">Your saved demo records remain in this browser.<br/>Frontend demonstration · No real authentication server</div></div></main>;
}
