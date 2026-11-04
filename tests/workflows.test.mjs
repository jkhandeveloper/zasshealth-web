import test from 'node:test';
import assert from 'node:assert/strict';
import {seed} from '../app/ui/data.ts';
import {validDate,minutes,availabilityError,bookingError,readDatabase,validDatabase,revenueByHour} from '../app/ui/validation.ts';
import {excelWorkbook} from '../app/ui/excel.ts';

const base=seed().availability,today='2026-10-28';
const booking=(time,appointments=[],date=today,a=base,id)=>bookingError(date,time,a,appointments,today,'08:00',id);
test('strict calendar dates reject overflow and support leap years',()=>{assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('2028-02-29'),true);assert.equal(validDate('2026-02-29'),false);assert.equal(validDate('not-a-date'),false)});
test('time parsing rejects malformed and out of range values',()=>{assert.equal(minutes('09:15'),555);for(const value of ['24:00','12:60','9:00','xx'])assert.ok(Number.isNaN(minutes(value)))});
test('default weekday consultation and MR availability is valid',()=>assert.equal(availabilityError(base),''));
test('availability requires days, chronological hours and full slots',()=>{assert.ok(availabilityError({...base,days:[]}));assert.ok(availabilityError({...base,start:'14:00'}));assert.ok(availabilityError({...base,start:'09:00',end:'09:05'}));assert.ok(availabilityError({...base,slot:13}))});
test('MR time may touch consultation boundary but cannot overlap',()=>{assert.equal(availabilityError({...base,mrStart:'14:00'}),'');assert.match(availabilityError({...base,mrStart:'13:45'}),/overlap/)});
test('valid first and last full slots can be booked',()=>{assert.equal(booking('09:00'),'');assert.equal(booking('13:45'),'')});
test('booking rejects past dates and past times on current day',()=>{assert.match(booking('09:00',[],'2026-10-27'),/future/);assert.match(booking('07:45'),/future/);assert.match(booking('08:00'),/future/)});
test('booking rejects weekends and slots outside consultation hours',()=>{assert.ok(booking('09:00',[],'2026-10-31'));assert.ok(booking('14:00'));assert.ok(booking('09:05'))});
test('changed slot sizes cannot overlap an existing longer appointment',()=>{const list=[{id:1,date:today,time:'09:00',duration:30,status:'Confirmed'}];assert.match(booking('09:15',list),/overlap/);assert.equal(booking('09:30',list),'')});
test('rescheduling excludes the appointment itself',()=>assert.equal(booking('09:00',[{id:1,date:today,time:'09:00',duration:15,status:'Confirmed'}],today,base,1),''));
test('cancelled appointment releases its slot',()=>assert.equal(booking('09:00',[{id:1,date:today,time:'09:00',duration:15,status:'Cancelled'}]),''));
test('completed appointment retains its occupied interval',()=>assert.match(booking('09:00',[{id:1,date:today,time:'09:00',duration:15,status:'Completed'}]),/overlap/));
test('new consultation slot cannot extend past clinic closing',()=>assert.ok(booking('13:45',[],today,{...base,slot:30})));
test('seed database passes schema validation',()=>assert.equal(validDatabase(seed()),true));
test('malformed saved data recovers without crashing',()=>{for(const raw of ['null','{}','{broken','{"patients":[]}']){const result=readDatabase(raw,seed());assert.equal(result.recovered,true);assert.equal(result.data.patients.length,8)}});
test('legacy appointment data gains a stable 15 minute duration',()=>{const data=seed(),result=readDatabase(JSON.stringify(data),seed());assert.equal(result.recovered,false);assert.equal(result.data.appointments[0].duration,15)});
test('orphaned patient references and duplicate ids are rejected',()=>{const data=seed();data.appointments[0].patient=999;assert.equal(validDatabase(data),false);const duplicate=seed();duplicate.patients.push(duplicate.patients[0]);assert.equal(validDatabase(duplicate),false)});
test('corrupt prescriptions and invalid availability are rejected',()=>{const data=seed();data.prescriptions.push({id:1,patient:1,date:today,store:'Demo',notes:'',medicines:[]});assert.equal(validDatabase(data),false);const other=seed();other.availability.days=['Wrong'];assert.equal(validDatabase(other),false)});
test('revenue includes completed visits beyond original chart hours',()=>{const result=revenueByHour([{time:'07:00',status:'Completed',fee:250},{time:'17:30',status:'Completed',fee:750},{time:'17:00',status:'Cancelled',fee:500}]);assert.equal(result.reduce((sum,x)=>sum+x.value,0),1000);assert.equal(result.find(x=>x.hour===17).value,750);assert.equal(result[0].label,'07:00')});
test('empty revenue buckets remain zero',()=>assert.ok(revenueByHour([]).every(b=>b.value===0)));

function unzipStored(bytes){const files={};let offset=0;const decoder=new TextDecoder();while(new DataView(bytes.buffer,bytes.byteOffset+offset).getUint32(0,true)===0x04034b50){const view=new DataView(bytes.buffer,bytes.byteOffset+offset),size=view.getUint32(18,true),nameSize=view.getUint16(26,true),extra=view.getUint16(28,true),name=decoder.decode(bytes.slice(offset+30,offset+30+nameSize)),start=offset+30+nameSize+extra,data=bytes.slice(start,start+size);let checksum=0xffffffff;for(const value of data){checksum^=value;for(let n=0;n<8;n++)checksum=checksum&1?(checksum>>>1)^0xedb88320:checksum>>>1}assert.equal((checksum^0xffffffff)>>>0,view.getUint32(14,true));files[name]=decoder.decode(data);offset=start+size}assert.equal(new DataView(bytes.buffer,bytes.byteOffset+offset).getUint32(0,true),0x02014b50);return files}
test('Excel export is a real ZIP workbook with valid checksums and relationships',()=>{const result=excelWorkbook([['Patient','Fee'],['Demo',500]]),files=unzipStored(result);assert.equal(Object.keys(files).length,6);assert.match(files['[Content_Types].xml'],/spreadsheetml.sheet.main/);assert.match(files['xl/worksheets/sheet1.xml'],/<v>500<\/v>/);assert.match(files['xl/worksheets/sheet1.xml'],/state="frozen"/)});
test('Excel export preserves Unicode and formula-like text without executable formulas',()=>{const files=unzipStored(excelWorkbook([['Patient'],['=1+1'],['A&B <Demo> ₹']])),sheet=files['xl/worksheets/sheet1.xml'];assert.match(sheet,/=1\+1/);assert.ok(!sheet.includes('<f>'));assert.match(sheet,/A&amp;B &lt;Demo&gt; ₹/)});
