import {API_MODE} from '../../ui/api';
import LivePortal from '../../ui/LivePortal';
import LogoutPage from '../../ui/LogoutPage';
export default function Page(){return API_MODE?<LivePortal/>:<LogoutPage admin/>}
