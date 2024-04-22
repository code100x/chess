import { WORKER_PROCESSES } from "./enums";

//todo: add a common module
export interface PublishType {
    type: WORKER_PROCESSES,
    //todo: strict the type
    payload: any
}