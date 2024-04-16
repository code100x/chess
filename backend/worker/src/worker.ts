import { Redis } from "./Redis";
import { WORKER_QUEUE, WORKER_PROCESSES } from "@chess/common";
import { sendOtp, updateGame } from "./process";

export const processQueue = async () => {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const response = await Redis.getInstance().popQueue(WORKER_QUEUE);
            if (!response) {
                console.log('Verification queue is empty...');
                //wait for 4 seconds before checking again
                setTimeout(resolve, 4000);
            } else {
                console.log('Processing queue...');
                await processWorker(response);
                // Hold to avoid overwelming the worker
                clearTimeout(setTimeout(resolve, 1000 * 10));
                resolve();
            }
        } catch (error) {
            console.error('Error while processing queue:', error);
            reject()
        }
    });
}

export const processWorker = async (response: string) => {
    try {
        //todo: make the type stronger
        const parsedResponse = JSON.parse(response);
        const { type, payload } = parsedResponse;
        switch (type as WORKER_PROCESSES) {
            case WORKER_PROCESSES.SEND_OTP:
                await sendOtp(payload);
                break;
            case WORKER_PROCESSES.DB_ADD_PLAYER:
                await updateGame(payload);
                break;
            //todo: Add more worker processes
            default:
                console.log(`ERROR: Unknown worker process type: ${type}`);
                break;
        }
    } catch (e) {
        console.log(`ERROR: while processing queue`);
        console.log(e);
    }
}