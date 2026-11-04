import {API_MODE} from '../../ui/api';
import LivePortal from '../../ui/LivePortal';
import PatientLogout from '../../ui/PatientLogout';
export default function Page(){return API_MODE?<LivePortal/>:<PatientLogout/>}
