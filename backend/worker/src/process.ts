import { GameRole } from "@chess/common";
import { Redis } from "./Redis";
import { addPlayer } from "./db/game";
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
    console.log("Otp send to ", id)
    return true
}

export const updateGame = async ({
    gameId,
    userId,
    role
}: {
    gameId: string,
    userId: string,
    role: string
}): Promise<void> => {
    await addPlayer(gameId, userId, role as GameRole.Black | GameRole.White);
    console.log(`Player with role as ${role} added to game ${gameId}`)
    return;
}