import {API_MODE} from '../../ui/api';
import LivePortal from '../../ui/LivePortal';
import PatientApp from '../../ui/PatientApp';
export function generateStaticParams(){return ['login','register','dashboard','profile','appointments','prescriptions'].map(page=>({slug:[page]}))}
export default function Page(){return API_MODE?<LivePortal/>:<PatientApp/>}
