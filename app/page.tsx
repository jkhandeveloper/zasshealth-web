import {API_MODE} from './ui/api';
import LivePortal from './ui/LivePortal';
import ClinicApp from './ui/ClinicApp';
export default function Page() { return API_MODE?<LivePortal/>:<ClinicApp />; }
