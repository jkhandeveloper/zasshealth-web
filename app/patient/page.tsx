import {API_MODE} from '../ui/api';
import LivePortal from '../ui/LivePortal';
import PatientApp from '../ui/PatientApp';
export default function Page(){return API_MODE?<LivePortal/>:<PatientApp/>}
