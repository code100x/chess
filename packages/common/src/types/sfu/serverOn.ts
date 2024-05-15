import { SFUMessageType } from "./messageType";
import {
    RtpCapabilities, DtlsParameters
} from 'mediasoup/node/lib/types';
import { IProducePayload } from "./payloads";


export interface IJoinRoom {
    type: SFUMessageType.JOIN_ROOM;
    payload: {
      roomId: string;
    };
  }
  
  export interface ICreateProducerTransport {
    type: SFUMessageType.CREATE_PRODUCER_TRANSPORT;
  }
  
  export interface IConnectProducerTransport {
    type: SFUMessageType.CONNECT_PRODUCER_TRANSPORT;
    payload: {
      dtlsParameters: DtlsParameters;
    };
  }
  
  
  export interface IProduce {
    type: SFUMessageType.PRODUCE;
    payload: IProducePayload;
  }
  
  export interface ICreateConsumerTransport {
    type: SFUMessageType.CREATE_CONSUMER_TRANSPORT;
  }
  
  export interface IConnectConsumerTransport {
    type: SFUMessageType.CONNECT_CONSUMER_TRANSPORT;
    payload: {
      dtlsParameters: DtlsParameters;
    };
  }
  
  export interface IGetProducers {
    type: SFUMessageType.GET_PRODUCERS;
  }
  
  export interface IResume {
    type: SFUMessageType.RESUME;
    payload: {
      consumerId: string;
    };
  }
  
  export interface IConsume {
    type: SFUMessageType.CONSUME;
    payload: {
      rtpCapabilities: RtpCapabilities;
    };
  }
  
  export type SFUServerMessageReceived =
    | IJoinRoom
    | ICreateProducerTransport
    | IConnectProducerTransport
    | IProduce
    | ICreateConsumerTransport
    | IConnectConsumerTransport
    | IGetProducers
    | IResume
    | IConsume;
  
  export type SFUClientMessageSent = SFUServerMessageReceived;