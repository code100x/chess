import {
    RtpParameters,
    MediaKind, IceParameters,
    IceCandidate,
    DtlsParameters,
    AppData
} from 'mediasoup/node/lib/types';

export interface ITransportPayload {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
}

export interface ISubscribedPayload {
  producerId: string;
  id: string;
  rtpParameters: RtpParameters;
  kind: MediaKind;
  type: string;
  producerPaused: boolean;
}

export interface IProducePayload {
  kind: MediaKind;
  rtpParameters: RtpParameters;
  appData: AppData;
}
