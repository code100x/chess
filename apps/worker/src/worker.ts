import { Redis } from "./Redis";
import { WORKER_QUEUE } from "./types/constants";
import { WORKER_PROCESSES } from "./types/enums";
import { addMove } from "./process";

export const processQueue = async () => {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const response = await Redis.getInstance().popQueue(WORKER_QUEUE);

            if (!response) {
                console.log('Queue is empty...');
                //wait for 5 seconds before checking again
                setTimeout(resolve, 5000);
            } else {
                console.log('Processing queue...');
                await processWorker(response);
                // Hold to avoid overwelming the worker
                clearTimeout(setTimeout(resolve, 1000 * 5));
                resolve();
            }

        } catch (error) {
            console.error('Error while processing queue:', error);
            reject()
        }
    });
}

//todo: Identify more process to be added
export const processWorker = async (response: string) => {
    try {
        //todo: make the type stronger
        const parsedResponse = JSON.parse(response);
        const { type, payload } = parsedResponse;
        switch (type as WORKER_PROCESSES) {
            case WORKER_PROCESSES.ADD_MOVE:
                await addMove(payload.from, payload.to, payload.gameId, payload.startFen, payload.endFen, payload.moveNumber, payload.createdAt, payload.timeTaken);
                break;
            
            default:
                console.log(`ERROR: Unknown worker process type: ${type}`);
                break;
        }
    } catch (e) {
        console.log(`ERROR: while processing queue`);
        console.log(e);
    }
}