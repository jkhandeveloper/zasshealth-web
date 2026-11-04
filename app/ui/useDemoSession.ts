'use client';
import {useEffect,useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';

export const SESSION_KEY='zass-demo-session-v1';
type Session={role:'doctor'|'admin';email:string};

// This controls the demo UI only. It is not server-side authentication.
export function useDemoSession(path:string,doctorBlocked=false){
 const router=useRouter();
 const [checkedPath,setCheckedPath]=useState(''),[error,setError]=useState('');
 const admin=path.startsWith('/admin');
 const publicPage=path==='/'||path==='/login'||path==='/login/'||path==='/admin/login'||path==='/admin/login/';
 useEffect(()=>{
  setError('');
  function check(){
   if(publicPage){setCheckedPath(path);return}
   try{
    const session:Session|null=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null');
    const valid=session?.role===(admin?'admin':'doctor')&&session?.email===(admin?'admin@zasshealth.demo':'doctor@zasshealth.demo')&&(admin||!doctorBlocked);
    setCheckedPath(valid?path:'');
    if(!valid)router.replace(admin?'/admin/login/':'/login/');
   }catch{setCheckedPath('');router.replace(admin?'/admin/login/':'/login/')}
  }
  check();
  window.addEventListener('pageshow',check);window.addEventListener('focus',check);
  return()=>{window.removeEventListener('pageshow',check);window.removeEventListener('focus',check)};
 },[path,admin,publicPage,router,doctorBlocked]);
 function signIn(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const f=new FormData(e.currentTarget),email=String(f.get('email')).trim().toLowerCase(),password=String(f.get('password'));
  const expected=admin?'admin@zasshealth.demo':'doctor@zasshealth.demo';
  if(!admin&&doctorBlocked){setError('This doctor account is blocked. Ask the demo administrator to unblock it.');return}
  if(email!==expected||password!=='demo1234'){setError(`Use ${expected} and password demo1234 to enter this demo.`);return}
  try{sessionStorage.setItem(SESSION_KEY,JSON.stringify({role:admin?'admin':'doctor',email}));setError('');router.push(admin?'/admin/dashboard/':'/doctor/dashboard/')}
  catch{setError('Session storage is unavailable. Allow browser site storage and try again.')}
 }
 return {allowed:checkedPath===path,error,signIn};
}
