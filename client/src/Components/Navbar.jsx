import { useSelector } from 'react-redux'
import Logoimg from '../assets/logo.png'
import { CgProfile } from "react-icons/cg";

function Navbar() {
    const data = useSelector((state) => state.apostleAdmin)
    const user = data?.currentUser
  return (
    <nav className="fixed top-0 left-0 w-full h-[65px] bg-primary-color flex items-center justify-between px-10 tablet:px-6 py-6">
        <h1 className='uppercase text-white font-semibold text-[35px] tablet:text-[24px] phone:text-[20px]'>Apostolic</h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <CgProfile className='text-[24px] text-white' />
            <p className='text-white'>Hello, {user?.name}</p>
          </div>

          <p className='text-white cursor-pointer'>Logout</p>
        </div>
    </nav>
  )
}

export default Navbar
