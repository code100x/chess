import {
  RtpCapabilities,
  IceParameters,
  IceCandidate,
  DtlsParameters,
} from 'mediasoup/node/lib/types';
import { SFUMessageType } from './messageType';
import { ISubscribedPayload, ITransportPayload } from './payloads';

export interface ISendConsumerConnected {
  type: SFUMessageType.CONSUMER_CONNECTED;
  payload: {
    message: string;
  };
}

export interface ISendSubscribed {
  type: SFUMessageType.SUBSCRIBED;
  payload: ISubscribedPayload;
}

export interface ISendNewProducer {
  type: SFUMessageType.NEW_PRODUCER;
  payload: {
    producerId: string;
  };
}

export interface ISendProducerConnected {
  type: SFUMessageType.PRODUCER_CONNECTED;
  payload: {
    message: string;
  };
}

export interface ISendJoinRoom {
  type: SFUMessageType.JOIN_ROOM;
  payload: {
    rtpCapabilities: RtpCapabilities;
  };
}

export interface ISendRoomFull {
  type: SFUMessageType.ROOM_FULL;
  payload: { message: string };
}
export interface ISendCreateProducerTransport {
  type: SFUMessageType.CREATE_PRODUCER_TRANSPORT;
  payload: {
    params: ITransportPayload;
  };
}
export interface ISendCreateConsumerTransport {
  type: SFUMessageType.CREATE_CONSUMER_TRANSPORT;
  payload: {
    params: ITransportPayload;
  };
}

export interface ISendProduced {
  type: SFUMessageType.PRODUCED;
  payload: {
    id: string;
    producersExist: boolean;
  };
}

export interface ISendGetProducers {
  type: SFUMessageType.GET_PRODUCERS;
  payload: { producersList: string[] };
}

export interface ISendProducerClosed {
  type: SFUMessageType.PRODUCER_CLOSED;
  payload: { remoteProducerId: string };
}

export type SFUServerMessageSent =
  | ISendJoinRoom
  | ISendRoomFull
  | ISendCreateProducerTransport
  | ISendCreateConsumerTransport
  | ISendProducerConnected
  | ISendProduced
  | ISendConsumerConnected
  | ISendSubscribed
  | ISendNewProducer
  | ISendGetProducers
  | ISendProducerClosed;

export type SFUClientMessageReceived = SFUServerMessageSent;
