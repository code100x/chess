import { transporter } from ".";
import { GMAIL } from "./config";
import * as speakeasy from "speakeasy";


//todo: add mobile number to the user model
/**
 * 
 * @param name 
 * @param email 
 * @param otp 
 */
export const sendOTP = async (
    name: string,
    email: string,
    otp: number,
) => {
    //todo: create a template for the email
    const mailOptions = {
        from: GMAIL,
        to: email,
        subject: 'Code100x Chess Email Verification',
        text: `Hello ${name},\n\nYour OTP is ${otp}.\n\nRegards,\nCode100x Chess Team`,
    };

    try {

        await transporter.sendMail(mailOptions);
        console.log('OTP sent successfully to', email);
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
}

/**
* 
* @returns Opt
*/
export const genOtp = (digits: number, time: number): number => {
    const otp = speakeasy.totp({
        secret: speakeasy.generateSecret().base32,
        digits: digits,
        encoding: 'base32',
        step: time
    });
    return Number(otp);
}