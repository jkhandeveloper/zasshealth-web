import type {Database,Patient} from './data';
export const DATABASE_KEY='zass-next-frontend-v1';
export const ACCOUNTS_KEY='zass-patient-accounts-v1';
export type PatientAccount={patientId:number;email:string;salt:string;hash:string};
export type PatientSession={role:'patient';patientId:number;email:string};
export type Registration={name:string;email:string;phone:string;age:number;gender:string;allergies:string;password:string;confirmPassword:string};
export const normalizeEmail=(value:string)=>value.trim().toLowerCase();
export const normalizePhone=(value:string)=>value.replace(/\D/g,'');
export function profileError(input:Pick<Registration,'name'|'phone'|'age'|'gender'>,patients:Patient[],excludeId?:number){
 if(input.name.trim().length<2||input.name.trim().length>80)return 'Enter your full name (2–80 characters).';
 if(!Number.isInteger(input.age)||input.age<1||input.age>120)return 'Age must be a whole number between 1 and 120.';
 if(!['Female','Male','Other','Prefer not to say'].includes(input.gender))return 'Select your gender.';
 const phone=normalizePhone(input.phone);
 if(!/^[+\d\s().-]+$/.test(input.phone)||phone.length<10||phone.length>15)return 'Enter a valid phone number with 10–15 digits.';
 if(patients.some(p=>p.id!==excludeId&&normalizePhone(p.phone)===phone))return 'This phone number is already registered. Sign in to your account or contact the clinic.';
 return '';
}
export function registrationError(input:Registration,data:Database,accounts:PatientAccount[]){
 const error=profileError(input,data.patients);if(error)return error;
 const email=normalizeEmail(input.email);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return 'Enter a valid email address.';
 if(accounts.some(a=>normalizeEmail(a.email)===email))return 'An account with this email already exists. Please sign in.';
 if(input.password.length<8||input.password.length>128)return 'Use a demo password between 8 and 128 characters.';
 if(input.password!==input.confirmPassword)return 'Passwords do not match.';
 return '';
}
export function readPatientAccounts(raw:string|null):PatientAccount[]{
 if(!raw)return [];
 let value:unknown;try{value=JSON.parse(raw)}catch{throw Error('Saved patient accounts could not be read. Please contact the clinic before creating another account.')}
 if(!Array.isArray(value)||!value.every(a=>a&&typeof a==='object'&&Number.isFinite(a.patientId)&&typeof a.email==='string'&&/^[a-f0-9]{32}$/.test(a.salt)&&/^[a-f0-9]{64}$/.test(a.hash))||new Set(value.map(a=>normalizeEmail(a.email))).size!==value.length||new Set(value.map(a=>a.patientId)).size!==value.length)throw Error('Saved patient accounts could not be read. Please contact the clinic before creating another account.');
 return value;
}
export async function hashDemoPassword(password:string,salt:string){
 if(!globalThis.crypto?.subtle)throw Error('Demo registration requires HTTPS or localhost. Please open this site using a supported secure address.');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const saltBytes=Uint8Array.from(salt.match(/.{2}/g)!.map(x=>parseInt(x,16)));
 const bytes=await crypto.subtle.deriveBits({name:'PBKDF2',salt:saltBytes,iterations:100000,hash:'SHA-256'},key,256);
 return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
}
export function createPatientRegistration(data:Database,accounts:PatientAccount[],input:Registration,credential:{salt:string;hash:string}){
 const error=registrationError(input,data,accounts);if(error)throw Error(error);
 const id=Math.max(0,...data.patients.map(p=>p.id))+1;
 const patient:Patient={id,name:input.name.trim(),age:input.age,gender:input.gender,phone:input.phone.trim(),allergies:input.allergies.trim()||'None recorded',reason:'Self-registered patient',history:[]};
 const account:PatientAccount={patientId:id,email:normalizeEmail(input.email),...credential};
 return {data:{...data,patients:[...data.patients,patient]},accounts:[...accounts,account],session:{role:'patient' as const,patientId:id,email:account.email},patient};
}
export function matchPatientSession(value:unknown,accounts:PatientAccount[],data:Database):PatientSession|null{
 if(!value||typeof value!=='object')return null;
 const s=value as Partial<PatientSession>;
 return s.role==='patient'&&typeof s.patientId==='number'&&typeof s.email==='string'&&accounts.some(a=>a.patientId===s.patientId&&a.email===s.email)&&data.patients.some(p=>p.id===s.patientId)?s as PatientSession:null;
}
