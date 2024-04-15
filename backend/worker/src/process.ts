import { Redis } from "./Redis";
import { genOtp, sendOTP } from "./utils";

export const sendOtp = async ({
    email,
    name,
    id,
}: {
    email: string,
    name: string,
    id: string
}) => {
    console.log('Sending OTP to', email, name);
    const otp = genOtp(6, 120);
    await sendOTP(name, email, otp);
    await Redis.getInstance().getClient.set(otp.toString(), id, {
        EX: 60 * 10
    });
    return true
}