import { useDispatch, useSelector } from 'react-redux'
import Logoimg from '../assets/logo.png'
import { CgProfile } from "react-icons/cg";
import { logout } from '../Helpers/apis';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signOut } from '../Redux/admin/adminSlice';

function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
    const data = useSelector((state) => state.apostleAdmin)
    const user = data?.currentUser

    const handleLogout = async () => {
      try {
        const res = await logout()
        if(res.success){
          toast.success(res?.data)
          dispatch(signOut())
          navigate('/')
        }
      } catch (error) {
        
      }
    }
  return (
    <nav className="fixed z-[999] top-0 left-0 w-full h-[65px] bg-primary-color flex items-center justify-between px-10 tablet:px-6 py-6 phone:px-4 ">
        <h1 className='uppercase text-white font-semibold text-[35px] tablet:text-[24px] phone:text-[20px]'>APOSTLES</h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <CgProfile className='text-[24px] text-white' />
            <p className='text-white'>Hello, <br /> {user?.name}</p>
          </div>

          <p onClick={handleLogout} className='text-white cursor-pointer'>Logout</p>
        </div>
    </nav>
  )
}

export default Navbar
