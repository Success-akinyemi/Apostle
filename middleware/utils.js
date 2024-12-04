import OtpModel from "../model/Otp.js";

export async function generateOtp(userId, email) {
    const generateOtp = () => {
        // Generate a random 6-digit number
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
        return otp;
    };

    let otp;
    let exists = true;

    while (exists) {
        otp = generateOtp();
        exists = await OtpModel.findOne({ code: otp });
    }

    const otpCode = await new OtpModel({
        userId: userId,
        code: otp,
        email: email,
    }).save();

    return otp; 
}