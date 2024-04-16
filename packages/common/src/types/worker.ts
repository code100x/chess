import { WORKER_PROCESSES } from "../enums";

export interface PublishType {
    type: WORKER_PROCESSES,
    payload: any
}