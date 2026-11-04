import type {Appointment,Availability,Database} from './data';

export const WORK_DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
export function validDate(value:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value+'T12:00:00');
 return !Number.isNaN(date.getTime())&&`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`===value;
}
export function minutes(value:string){return /^([01]\d|2[0-3]):[0-5]\d$/.test(value)?Number(value.slice(0,2))*60+Number(value.slice(3)):NaN}
export function availabilityError(a:Availability){
 if(!a.days.length||a.days.some(d=>!WORK_DAYS.includes(d)))return 'Choose at least one working day.';
 if(![10,15,20,30,45,60].includes(a.slot))return 'Choose a valid slot duration.';
 if([a.start,a.end,a.mrStart,a.mrEnd].some(t=>!Number.isFinite(minutes(t)))||a.start>=a.end||a.mrStart>=a.mrEnd)return 'End times must be after start times.';
 if(minutes(a.end)-minutes(a.start)<a.slot)return 'Consultation hours must fit at least one full slot.';
 if(a.mrStart<a.end&&a.mrEnd>a.start)return 'Patient and MR visiting hours must not overlap.';
 return '';
}
export function bookingError(date:string,time:string,a:Availability,appointments:Appointment[],today:string,currentTime:string,id?:number,doctorId=1){
 if(!validDate(date)||!Number.isFinite(minutes(time)))return 'Choose a valid appointment date and time.';
 if(date<today||(date===today&&time<=currentTime))return 'Appointments must start in the future.';
 const day=WORK_DAYS[(new Date(date+'T12:00:00').getDay()+6)%7],start=minutes(time),end=start+a.slot;
 if(!a.days.includes(day)||start<minutes(a.start)||end>minutes(a.end)||(start-minutes(a.start))%a.slot!==0)return 'Choose a working day and a valid consultation slot.';
 if(appointments.some(x=>x.id!==id&&(x.doctorId??1)===doctorId&&x.date===date&&x.status!=='Cancelled'&&start<minutes(x.time)+(x.duration||15)&&end>minutes(x.time)))return 'This slot overlaps an existing appointment. Select another time.';
 return '';
}
export function revenueByHour(appointments:Appointment[]){return Array.from({length:24},(_,hour)=>({hour,label:`${String(hour).padStart(2,'0')}:00`,value:appointments.filter(a=>a.status==='Completed'&&Number(a.time.slice(0,2))===hour).reduce((sum,a)=>sum+a.fee,0)})).filter((bucket,_,all)=>bucket.value>0||(bucket.hour>=Math.min(9,...all.filter(x=>x.value>0).map(x=>x.hour))&&bucket.hour<=Math.max(14,...all.filter(x=>x.value>0).map(x=>x.hour))))}

const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown):v is string=>typeof v==='string';
const num=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const fields=(r:Record<string,unknown>,keys:string[])=>keys.every(k=>text(r[k]));
const list=(v:unknown,test:(r:Record<string,unknown>)=>boolean):boolean=>Array.isArray(v)&&v.every(r=>record(r)&&num(r.id)&&test(r))&&new Set(v.map(r=>r.id)).size===v.length;
export function validDatabase(v:unknown):v is Database{
 if(!record(v))return false;
 if(!list(v.patients,p=>fields(p,['name','gender','phone','reason','allergies'])&&num(p.age)&&Array.isArray(p.history)&&p.history.every(h=>record(h)&&fields(h,['date','note'])&&validDate(String(h.date)))))return false;
 const ids=new Set((v.patients as Database['patients']).map(p=>p.id));
 if(!list(v.appointments,a=>ids.has(Number(a.patient))&&fields(a,['date','time','type','status'])&&validDate(String(a.date))&&Number.isFinite(minutes(String(a.time)))&&(a.doctorId===undefined||(num(a.doctorId)&&Array.isArray(v.doctors)&&v.doctors.some(d=>record(d)&&d.id===a.doctorId)))&&num(a.fee)&&a.fee>=0&&['Pending','Confirmed','Completed','Cancelled'].includes(String(a.status))&&(a.duration===undefined||(num(a.duration)&&a.duration>0))))return false;
 if(!list(v.mrs,m=>fields(m,['name','company','brochure','status'])&&['Pending','Approved','Rejected'].includes(String(m.status)))||!list(v.doctors,d=>fields(d,['name','specialty','email','status'])&&['Pending','Approved','Blocked'].includes(String(d.status)))||!list(v.stores,s=>fields(s,['name','city','status'])&&['Pending','Approved','Blocked'].includes(String(s.status))))return false;
 if(!list(v.prescriptions,p=>ids.has(Number(p.patient))&&fields(p,['date','store','notes'])&&validDate(String(p.date))&&Array.isArray(p.medicines)&&p.medicines.length>0&&p.medicines.every(m=>record(m)&&fields(m,['name','dose','duration']))))return false;
 if(!record(v.availability)||!Array.isArray(v.availability.days)||!v.availability.days.every(text)||!fields(v.availability,['start','end','mrStart','mrEnd'])||!num(v.availability.slot)||availabilityError(v.availability as Availability))return false;
 const cms=v.cms;return record(cms)&&['Home','About Us','Contact Us'].every(k=>text(cms[k]));
}
export function readDatabase(raw:string|null,fallback:Database){
 if(!raw)return {data:fallback,recovered:false};
 try{const parsed:unknown=JSON.parse(raw);if(validDatabase(parsed))return {data:{...parsed,appointments:parsed.appointments.map(a=>({...a,duration:a.duration||15,doctorId:a.doctorId??1,status:a.status==='Pending'?'Confirmed':a.status}))},recovered:false}}catch{}
 return {data:fallback,recovered:true};
}
