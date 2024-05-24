import {DtlsParameters,RtpParameters,AppData,RtpCapabilities} from "mediasoup-client/lib/types";

export interface CustomAppData extends AppData {
    userId: string;
}

export enum ServerMessageType {
    WEBRTC_CONNECT = 'WEBRTC_CONNECT',
    WEBRTC_PRODUCER = 'WEBRTC_PRODUCER',
    WEBRTC_CONSUMER = 'WEBRTC_CONSUMER',
    WEBRTC_RESUME_CONSUMER = 'WEBRTC_RESUME_CONSUMER',
    JOIN_ROOM = 'JOIN_ROOM',
}

export interface WebRtcJoinRoomPayload {
    roomId: string;
}

export interface WebRtcJoinRoom {
    type: ServerMessageType.JOIN_ROOM;
    payload: WebRtcJoinRoomPayload
}

export interface WebRtcConnectPayload {
    transportId: string;
    dtlsParameters: DtlsParameters;
}

export interface WebRtcConnect {
    type: ServerMessageType.WEBRTC_CONNECT;
    payload: WebRtcConnectPayload;

}

export interface WebRtcProducerPayload {
    transportId: string;
    kind: string;
    rtpParameters: RtpParameters;
    appData: CustomAppData;

}

export interface WebRtcProducer {
    type: ServerMessageType.WEBRTC_PRODUCER;
    payload: WebRtcProducerPayload
}

export interface WebRtcConsumerPayload {
    transportId: string;
    producerId: string;
    rtpCapabilities: RtpCapabilities;

}

export interface WebRtcConsumer {
    type: ServerMessageType.WEBRTC_CONSUMER;
    payload: WebRtcConsumerPayload
}

export interface WebRtcResumeConsumerPayload {
    consumerId: string;
}

export interface WebRtcResumeConsumer {
    type: ServerMessageType.WEBRTC_RESUME_CONSUMER;
    payload: WebRtcResumeConsumerPayload
}

export type ServerMessage = WebRtcJoinRoom | WebRtcConnect | WebRtcProducer | WebRtcConsumer | WebRtcResumeConsumer;