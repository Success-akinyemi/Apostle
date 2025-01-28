import { registerMail } from "../middleware/sendEmail.js"
import { generateOtp } from "../middleware/utils.js"
import OtpModel from "../model/Otp.js"
import UserModel from "../model/User.js"

export async function register(req, res) {
    const { email, password, name } = req.body
    if(!name){
        return res.status(400).json({ success: false, data: 'Provide a name'})
    }
    if(name.length < 1){
        return res.status(400).json({ success: false, data: 'Invalid Name'})
    }
    if(!email){
        return res.status(400).json({ success: false, data: 'Provide an Email address' })
    }
    if(!password){
        return res.status(400).json({ success: false, data: 'Password is required'})
    }
    if (password.length < 6) {
        return res.status(400).json({ success: false, data: 'Passwords must be at least 6 characters long' });
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)){
        return res.status(401).json({ success: false, data: 'Invalid Email Address' })
    }

    const specialChars = /[!@#$%^&*()_+{}[\]\\|;:'",.<>?]/;
    if (!specialChars.test(password)) {
        return res.status(400).json({ success: false, data: 'Passwords must contain at least one special character' });
    }
    try {
        const emailExist = await UserModel.findOne({ email })
        if(emailExist){
            return res.status(400).json({ success: false, data: 'Email Already Exist please use another' })
        }

        const newUser = await UserModel.create({
            name: typeof name === 'string' ? name.trim() : name,
            email, 
            password
        })

        const otpCode = await generateOtp(newUser._id, newUser.email)
        console.log('OTP', otpCode)

        try {
            await registerMail({
                username: `${newUser.name}`,
                userEmail: newUser.email,
                subject: 'New Account Created',
                intro: 'Verify your Apostolic App email address',
                instructions: `Account created Succesful. Enter Otp and verify your Email Address. Your OTP code is: ${otpCode}. Note Otp is Valid for One (1) Hour.`,
                outro: `If you did not Sign Up, please ignore this email and report.
                `,
                otp: otpCode,
            });

            return res.status(200).json({ success: true, email: newUser?.email, data: `Signup successful check otp code sent to ${newUser.email} to activate account` });
        } catch (error) {
            console.log('ERROR SENDING VERIFY OTP EMAIL', error);
        }

        res.status(201).json({ success: true, data: 'Account created' })
        
    } catch (error) {
        console.log('UNABLE TO REGISTER USER', error)
        res.status(500).json({ success: false, data: 'Unable to register new user' })
    }
}

export async function verifyOtp(req, res) {
    const { otp } = req.body
    if(!otp){
        return res.status(400).json({ success: false, data: 'OTP code is Required' })
    }
    try {
        const getOtp = await OtpModel.findOne({ code: otp })
        if(!getOtp){
            return res.status(404).json({ success: false, data: 'Invalid code' })
        }  
        const getUser = await UserModel.findOne({ email: getOtp.email })
        getUser.verified = true
        await getUser.save()

        res.status(201).json({ success: true, data: 'Account verified'})
    } catch (error) {
        console.log('UNABLE TO VERIFY ACCOUNT OTP', error)
        res.status(500).json({ success: false, data: 'Unable to verify OTP code'})
    }
}

export async function resendOtp(req, res) {
    const { email } = req.body
    if(!email){
        return res.status(400).json({ success: false, data: 'Email Address is required'})
    }
    try {
        const getUser = await UserModel.findOne({ email })
        if(!getUser){
            return res.status(404).json({ success: false, data: 'User with does not exist please sign up' })
        }
        const otpExist = await OtpModel.findOne({ email })
        if(otpExist){
            const deleteOtp = await OtpModel.findByIdAndDelete({ _id: otpExist._id })
        }


        const otpCode = await generateOtp(getUser._id, getUser.email)
        console.log('OTP', otpCode)

        try {
            await registerMail({
                username: `${getUser.name}`,
                userEmail: getUser.email,
                subject: 'New Account Created',
                intro: 'Verify your Apostolic App  email address',
                instructions: `Account created Succesful. Enter Otp and verify your Email Address. Your OTP code is: ${otpCode}. Note Otp is Valid for One (1) Hour.`,
                outro: `If you did not Sign Up, please ignore this email and report.
                `,
                otp: otpCode,
            });

            return res.status(200).json({ success: true, email: email, data: `Signup successful check otp code sent to ${email} to activate account` });
        } catch (error) {
            console.log('ERROR SENDING VERIFY OTP EMAIL', error);
        }

        res.status(201).json({ success: true, data: 'Otp sent successful' })
        
    } catch (error) {
        console.log('UNABLE TO RESEND OTP', error)
        res.status(500).json({ success: false, data: 'Unable to resend OTP code' })
    }
}

export async function login(req, res) {
    const { email, password } = req.body;
    console.log('LOGIN ENDPOINT 1')
    if(!email || !password){
        return res.json(400).status({ success: false, data: 'Email and Password is required.'})
    }
    console.log('LOGIN ENDPOINT 2')
    try {
        const getUser = await UserModel.findOne({ email });
        if (!getUser) {
            return res.status(404).json({ success: false, data: 'User with email does not exist' });
        }

        const isMatch = await getUser.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, data: 'Invalid credentials' });
        }

        if (!getUser.verified) {
            const otpExist = await OtpModel.findOne({ email });
            if (!otpExist) {
                const otpCode = await generateOtp(getUser._id, getUser.email);
                console.log('OTP', otpCode);

                try {
                    await registerMail({
                        username: `${getUser.name}`,
                        userEmail: getUser.email,
                        subject: 'New Account Created',
                        intro: 'Verify your Apostolic App email address',
                        instructions: `Account created successfully. Your OTP code is: ${otpCode}. Note: OTP is valid for One (1) Hour.`,
                        outro: `If you did not sign up, please ignore this email and report.`,
                        otp: otpCode,
                    });

                    return res.status(200).json({
                        success: true,
                        email: getUser.email,
                        data: `Signup successful. Check OTP sent to ${getUser.email} to activate your account.`,
                    });
                } catch (error) {
                    console.log('ERROR SENDING VERIFY OTP EMAIL', error);
                }
            }
        }

        // Generate Tokens
        const accessToken = getUser.getAccessToken()
        const refreshToken = getUser.getRefreshToken()

        // Set cookies
        res.cookie('apostolicaccesstoken', accessToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie('apostolictoken', refreshToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        const { password: hashedPassword, resetPasswordToken, resetPasswordExpire, ...userData } = getUser._doc;
        res.status(200).json({ success: true, token: refreshToken, data: userData });
    } catch (error) {
        console.log('UNABLE TO LOGIN USER', error);
        res.status(500).json({ success: false, data: 'Unable to login user' });
    }
}

export async function forgotPassword(req, res) {
    const { email } = req.body
    if(!email){
        return res.status(400).json({ success: false, data: 'Provide an email address' })
    }
    try {
        const getUser = await UserModel.findOne({ email })
        if(!getUser){
            return res.status(404).json({ success: false, data: 'Email does not exist' })
        }

        const otpCode = await generateOtp(getUser._id, getUser.email)
        console.log('OTP', otpCode)

        try {
            await registerMail({
                username: `${getUser.name}`,
                userEmail: getUser.email,
                subject: 'Password Reset Request',
                intro: '',
                instructions: `You request for password reset on your account. Your OTP code is: ${otpCode}. Note Otp is Valid for One (1) Hour.`,
                outro: `If you did not request for password request, please ignore this email and you might consider changing your password.
                `,
                otp: otpCode,
            });

            return res.status(200).json({ success: true, email: getUser?.email, data: `Reset password Otp successful sent to ${getUser.email}.` });
        } catch (error) {
            console.log('ERROR SENDING VERIFY OTP EMAIL', error);
        }
    } catch (error) {
        console.log('UNABLE TO PROCESS FORGOT PASSWORD REQUEST', error)
        res.status(500).json({ success: false, data: 'Unable to process forgot password requst' })
    }
}

export async function resetPassword(req, res) {
    const { otp, password } = req.body
    try {
        const getOtp = await OtpModel.findOne({ code: otp })
        if(!getOtp){
            return res.status(404).json({ success: false, data: 'Invalid code' })
        }  

        const getUser = await UserModel.findOne({ email: getOtp.email })
        getUser.password = password
        await getUser.save()

        res.status(201).json({ success: true, data: 'Password reset successful' })
    } catch (error) {
        console.log('UNABLE TO PROCESS RESET PASSWORD REQUEST', error)
        res.status(500).json({ success: false, data: 'Unable to process password reset' })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie(`apostolicaccesstoken`)
        res.clearCookie('apostolictoken').status(200).json({success: true, data: 'Signout success'})
    } catch (error) {
        console.log('UNABLE TO SIGNOUT USER', error)
        res.status(500).json({ success: false, data: '' })
    }
}

export async function verifyToken(req, res) {
    const accessToken = req.cookies.apostolicadminaccesstoken;
    const refreshToken = req.cookies.apostolicadmintoken;

    try {
        if (accessToken) {
            try {
                // Validate the access token
                const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
                const user = await UserModel.findById(decoded.id);
                console.log('VERIFY TOKEN ACCESS TOKEN',decoded )
                
                if(user){
                    return res.status(403).json({ success: false, data: 'Unauthenticated' });
                }
                return res.status(200).json({ success: true, data: 'Authenticated' })
            } catch (error) {
                if (error.name !== 'TokenExpiredError') {
                    return res.status(403).json({ success: false, data: 'Unauthenticated' });
                }
                // If TokenExpiredError, fall through to handle the refresh token
            }
        }
    
        // Handle missing or expired access token
        if (refreshToken) {
            try {
                const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);
                const user = await UserModel.findById(decodedRefresh.id);
                if (!user) {
                    return res.status(403).json({ success: false, data: 'Unauthenticated' });
                }

                console.log('VERIFY REFRESH ACCESS TOKEN',decoded )    
                // Generate a new access token
                const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
                res.cookie('apostolicaccesstoken', newAccessToken, {
                    httpOnly: true,
                    sameSite: 'None',
                    secure: true,
                    maxAge: 15 * 60 * 1000, // 15 minutes
                });
                return res.status(200).json({ success: true, data: 'Authenticated' })
                
            } catch (refreshError) {
                return res.status(403).json({ success: false, data: 'Unauthenticated' });
            }
        }
    
        // Both tokens are invalid or missing
        return res.status(401).json({ success: false, data: 'Authentication required' });
    } catch (error) {
        console.log('UNABLE TO VERIFY USER TOKEN', error)
        res.status(500).json({ success: false, data: 'Unable to verify token' })
    }
}
/**
 export async function deleteAll(req, res) {
     try {
         const deleteAll = await UserModel.deleteMany()
 
         res.status(200).json({ success: true, data: 'User Deleted'})
     } catch (error) {
         console.log('ERROR', error)
     }
 }
 */