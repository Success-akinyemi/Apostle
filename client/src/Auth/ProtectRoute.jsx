import { useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {jwtDecode} from 'jwt-decode';
import { useEffect } from "react";

function AuthorizeUser() {
    const data  = useSelector((state) => state.apostleAdmin);
    const user = data?.currentUser
      const token = localStorage.getItem('apostletoken');
      const tokenExist = !!token;
      const navigate = useNavigate()
    
      useEffect(() => {
        if (!tokenExist && !user) {
          toast.error('PLEASE LOGIN');
          navigate('/')
          return
        } else {
          if(!token){
            navigate('/')
            return
          }
          const decodedToken = jwtDecode(token);
    
          // Check if the token is expired
          if (decodedToken.exp * 1000 < Date.now()) {
            toast.error('Session expiried, Please login');
            navigate('/')
          }
        }
      }, [data, tokenExist]); 
    
      return tokenExist && user ? <Outlet /> : <Navigate to={'/'} />;
    }

    export {AuthorizeUser}