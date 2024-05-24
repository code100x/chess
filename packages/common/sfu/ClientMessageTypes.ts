import {MediaKind, RtpParameters, AppData, IceParameters, DtlsParameters, IceCandidate, RtpCapabilities} from "mediasoup/node/lib/types";
import { CustomAppData } from "./ServerMessageTypes";

export enum ClientMessageType {
    WEBRTC_RESUME_CONSUMER_RESPONSE = 'WEBRTC_RESUME_CONSUMER_RESPONSE',
    WEBRTC_PRODUCERS = 'WEBRTC_PRODUCERS',
    WEBRTC_CONSUMER_RESPONSE = 'WEBRTC_CONSUMER_RESPONSE',
    WEBRTC_PRODUCER_RESPONSE = 'WEBRTC_PRODUCER_RESPONSE',
    WEBRTC_NEW_PRODUCER = 'WEBRTC_NEW_PRODUCER',
    WEBRTC_USER_DISCONNECTED = 'WEBRTC_USER_DISCONNECTED',
    WEBRTC_TRANSPORT_CONNECT_RESPONSE = 'WEBRTC_TRANSPORT_CONNECT_RESPONSE',
    WEBRTC_TRANSPORT_INITIALIZE = 'WEBRTC_TRANSPORT_INITIALIZE',
    ROOM_ERROR = 'ROOM_ERROR',
}


export interface WebRtcResumeConsumerResponsePayload {
    message: string;
    success: boolean;
}

export interface WebRtcResumeConsumerResponse {
    type: ClientMessageType.WEBRTC_RESUME_CONSUMER_RESPONSE;
    payload: WebRtcResumeConsumerResponsePayload;
}

export interface WebRtcProducersPayload {
    producers: {
        id: string;
        userId: string;
    }[];
}

export interface WebRtcProducers {
    type: ClientMessageType.WEBRTC_PRODUCERS;
    payload: WebRtcProducersPayload;
}

export interface WebRtcConsumerResponsePayload {
    message?: string;
    success: boolean;
    consumerId?: string;
    producerId?: string;
    kind?: MediaKind;
    rtpParameters?: RtpParameters;
    transportId?: string;
    appData?: CustomAppData;

}

export interface WebRtcConsumerResponse {
    type: ClientMessageType.WEBRTC_CONSUMER_RESPONSE;
    payload: WebRtcConsumerResponsePayload
}

export interface WebRtcProducerResponsePayload {
    message?: string;
    success: boolean;
    transportId: string;
    producerId?: string;

}

export interface WebRtcProducerResponse {
    type: ClientMessageType.WEBRTC_PRODUCER_RESPONSE;
    payload: WebRtcProducerResponsePayload;
}

export interface WebRtcNewProducerPayload {
    userId: string;
    producerId: string;
}

export interface WebRtcNewProducer {
    type: ClientMessageType.WEBRTC_NEW_PRODUCER;
    payload: WebRtcNewProducerPayload;
}

export interface WebRtcUserDisconnectedPayload {
    userId: string;

}

export interface WebRtcUserDisconnected {
    type: ClientMessageType.WEBRTC_USER_DISCONNECTED;
    payload: WebRtcUserDisconnectedPayload;
}

export interface WebRtcConnectResponsePayload {
    transportId: string;
    success: boolean;
}

export interface WebRtcConnectResponse {
    type: ClientMessageType.WEBRTC_TRANSPORT_CONNECT_RESPONSE;
    payload: WebRtcConnectResponsePayload;
}

export interface WebRtcTransportPayload {
    sender: {
        id: string;
        iceParameters: IceParameters,
        iceCandidates: IceCandidate[],
        dtlsParameters: DtlsParameters,
    },
    receiver: {
        id: string;
        iceParameters: IceParameters,
        iceCandidates: IceCandidate[],
        dtlsParameters: DtlsParameters,
    },
    routerRtpCapabilities: RtpCapabilities,
    producers: {
        id: string;
        userId: string;
    }[],
}

export interface WebRtcTransport {
    type: ClientMessageType.WEBRTC_TRANSPORT_INITIALIZE;
    payload: WebRtcTransportPayload;
}

export interface RoomErrorPayload {
    message: string;

}

export interface RoomError {
    type: ClientMessageType.ROOM_ERROR;
    payload: RoomErrorPayload
}

export type ClientMessagePayLoad = WebRtcResumeConsumerResponsePayload | WebRtcProducersPayload | WebRtcConsumerResponsePayload | WebRtcProducerResponsePayload | WebRtcNewProducerPayload | WebRtcUserDisconnectedPayload | WebRtcConnectResponsePayload | WebRtcTransportPayload | RoomErrorPayload;

export type ClientMessage = WebRtcResumeConsumerResponse | WebRtcProducers | WebRtcConsumerResponse | WebRtcProducerResponse | WebRtcNewProducer | WebRtcUserDisconnected | WebRtcConnectResponse | WebRtcTransport | RoomError;