export const API_URL=(process.env.NEXT_PUBLIC_API_URL||'http://localhost:3002/api').replace(/\/$/,'');
export const API_MODE=process.env.NEXT_PUBLIC_USE_API==='true';
const KEY='zass-api-session-v1';
export type ApiUser={id:string;name:string;phone:string;role:'PATIENT'|'DOCTOR'|'SUPER_ADMIN'|'PHARMACIST';age?:number;gender?:string;allergies?:string;pharmacyName?:string};
export type ApiSession={accessToken:string;user:ApiUser;expiresAt:number};
export function getApiSession():ApiSession|null{try{const s=JSON.parse(sessionStorage.getItem(KEY)||'null');return s?.accessToken&&s.expiresAt>Date.now()?s:null}catch{return null}}
export function saveApiSession(value:{accessToken:string;expiresIn:number;user:ApiUser}){sessionStorage.setItem(KEY,JSON.stringify({...value,expiresAt:Date.now()+value.expiresIn*1000}))}
export function clearApiSession(){sessionStorage.removeItem(KEY)}
export async function api<T>(path:string,options:{method?:string;body?:unknown;public?:boolean}={}):Promise<T>{
 const session=getApiSession();let response:Response;
 try{response=await fetch(API_URL+path,{method:options.method||'GET',headers:{...(options.body?{'Content-Type':'application/json'}:{}),...(!options.public&&session?{Authorization:'Bearer '+session.accessToken}:{})},body:options.body?JSON.stringify(options.body):undefined,cache:'no-store',signal:AbortSignal.timeout(15000)})}catch{throw Error('Backend se connection nahi hua. API server aur network/CORS settings check karein.')}
 const result=await response.json().catch(()=>({}));if(!response.ok){if(response.status===401&&!options.public)clearApiSession();throw Error(Array.isArray(result.message)?result.message.join(' '):result.message||`Request failed (${response.status}).`)}return result;
}
export type Page<T>={items:T[];total:number;page:number;limit:number};
export async function allPages<T>(path:string){let result:T[]=[];for(let page=1;;page++){const data=await api<Page<T>>(`${path}${path.includes('?')?'&':'?'}page=${page}&limit=100`);result=[...result,...data.items];if(result.length>=data.total||!data.items.length)return result}}
export const homeFor=(role:ApiUser['role'])=>role==='PATIENT'?'/patient/dashboard/':role==='DOCTOR'?'/doctor/dashboard/':role==='PHARMACIST'?'/pharmacist/dashboard/':'/admin/dashboard/';
