import {API_MODE} from '../ui/api';
import LivePortal from '../ui/LivePortal';
import ClinicApp from '../ui/ClinicApp';
export function generateStaticParams() { return ['login','doctor/dashboard','doctor/availability','doctor/calendar','doctor/patients','doctor/mr-requests','doctor/prescriptions','admin/login','admin/dashboard','admin/doctors','admin/patients','admin/partners','admin/reports','admin/cms'].map(path => ({ slug: path.split('/') })); }
export default function Page() { return API_MODE?<LivePortal/>:<ClinicApp />; }
