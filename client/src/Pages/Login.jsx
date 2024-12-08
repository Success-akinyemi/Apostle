import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import Button from "../Components/Button";
import LoadingBtn from "../Components/LoadingBtn";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../Helpers/apis";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../Redux/admin/adminSlice";

function Login() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [ showPassword, setShowPassword ] = useState()
    const [ formData, setFormData ] = useState({})

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev)
    }

    const [ loading, setLoading ] = useState(false)
    const handleLogin = async () => {
        if(!formData?.email){
            toast.error('Provide an email address')
            return
        }
        if(!formData?.password){
            toast.error('Provide a password')
            return
        }
        try {
            setLoading(true)
            const res = await login(formData)
            //console.log('RESz', res)
            if(res.success){
                toast.success('Login Success')
                localStorage.setItem('apostletoken', res?.token)
                dispatch(signInSuccess(res?.data))
                navigate('/dashboard')
            } else {
                toast.error(res.data)
            }
        } catch (error) {
            
        } finally {
            setLoading(false)
        }
    }
  return (
    <div className="page items-center justify-center">
        <div className="w-[500px] bg-white pad rounded-[10px] phone:w-[90%] flex flex-col gap-8">
            <h1 className="text-center text-[28px] text-primary-color font-semibold" >Apostle Music App</h1>
            <div className="inputGroup">
                <label className="label">Email</label>
                <input type="text" id="email" onChange={handleChange} className="input" placeholder="Enter Email Address" />
            </div>
            <div className="inputGroup">
                <label className="label">Password</label>
                <div className="relative">
                    <input id="password" onChange={handleChange} type={showPassword ? 'text' : 'password'} className="input" placeholder="Enter Password" />
                    {
                        showPassword ? (
                            <span onClick={handleTogglePassword} className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2">
                                <FaEye className="text-[20px]" />
                            </span>
                        ) : (
                            <span onClick={handleTogglePassword} className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2">
                                <FaEyeSlash className="text-[20px]" />
                            </span>
                        )
                    }
                </div>
            </div>

            {/**BUTTON */}
            {
                loading ? (
                    <LoadingBtn />
                ) : (
                    <Button onClick={handleLogin} text={'Login'} />
                )
            }

            <p>New User? <Link to={'/create-account'} className="text-primary-color">Create Account</Link></p>
        </div>
    </div>
  )
}

export default Login
