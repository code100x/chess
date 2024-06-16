import { useEffect, useRef, useState } from 'react';
import { useSfuSocket } from '../hooks/useSfuSocket';
import * as mediasoupClient from 'mediasoup-client';
import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters';
import {
  AppData,
  Consumer,
  Producer,
  Transport,
} from 'mediasoup-client/lib/types';
import { videoParams } from '../config/sfu';
import {
  ISubscribedPayload,
  ITransportPayload,
  SFUClientMessageReceived,
  SFUClientMessageSent,
  SFUMessageType,
} from '@repo/common/types';

export const useSFUClient = () => {
  const { socket, localStream } = useSfuSocket();
  const [device, setDevice] = useState<mediasoupClient.Device | null>(null);
  const [producer, setProducer] = useState<Producer<AppData> | null>(null);
  const [consumingTransports, setConsumingTransports] = useState<string[]>([]);
  const [consumerTransport, setConsumerTransport] =
    useState<Transport<AppData> | null>(null);
  const [consumer, setConsumer] = useState<Consumer<AppData> | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const sendMessage = (message: SFUClientMessageSent) => {
    socket?.send(JSON.stringify(message));
  };

  const createDevice = async (routerRtpCapabilities: RtpCapabilities) => {
    const newDevice = new mediasoupClient.Device();
    await newDevice.load({
      routerRtpCapabilities,
    });
    setDevice(newDevice);
    sendMessage({ type: SFUMessageType.CREATE_PRODUCER_TRANSPORT });
  };

  const signalNewConsumerTransport = async (remoteProducerId: string) => {
    if (consumingTransports.includes(remoteProducerId)) return;
    setConsumingTransports((prev) => [...prev, remoteProducerId]);
    sendMessage({ type: SFUMessageType.CREATE_CONSUMER_TRANSPORT });
  };

  const handleTransportOnProduce = (transport: Transport<AppData>) => {
    transport.on(
      'produce',
      async ({ kind, rtpParameters, appData }, callback, errback) => {
        try {
          sendMessage({
            type: SFUMessageType.PRODUCE,
            payload: {
              kind,
              rtpParameters,
              appData,
            },
          });
          socket?.addEventListener('message', (event) => {
            const message: SFUClientMessageReceived = JSON.parse(event.data);
            if (message.type === SFUMessageType.PRODUCED) {
              const { id, producersExist } = message.payload;
              callback({ id });
              if (producersExist)
                sendMessage({
                  type: SFUMessageType.GET_PRODUCERS,
                });
            }
          });
        } catch (error) {
          console.error('Error', error);
          errback(error as Error);
        }
      },
    );
  };

  const handleTransportOnConnect = (
    transport: Transport<AppData>,
    isProducer: boolean,
  ) => {
    transport?.on('connect', async ({ dtlsParameters }, callback, errback) => {
      try {
        sendMessage({
          type: isProducer
            ? SFUMessageType.CONNECT_PRODUCER_TRANSPORT
            : SFUMessageType.CONNECT_CONSUMER_TRANSPORT,
          payload: { dtlsParameters },
        });
        socket?.addEventListener('message', (event) => {
          const message: SFUClientMessageReceived = JSON.parse(event.data);
          const successMessage = isProducer
            ? SFUMessageType.PRODUCER_CONNECTED
            : SFUMessageType.CONSUMER_CONNECTED;
          if (message.type === successMessage) {
            callback();
          }
        });
      } catch (error) {
        errback(error as Error);
      }
    });
  };

  const handleCreateProducerTransport = async (payload: {
    params: ITransportPayload;
  }) => {
    const transport = device?.createSendTransport(payload.params);
    if (transport) {
      handleTransportOnConnect(transport, true);
      handleTransportOnProduce(transport);
      try {
        const track = localStream?.getVideoTracks()[0];
        if (track) {
          const producer = await transport?.produce({ track, ...videoParams });
          if (producer) setProducer(producer);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCreateConsumerTransport = async (payload: {
    params: ITransportPayload;
  }) => {
    const transport = device?.createRecvTransport(payload.params);
    if (transport) {
      handleTransportOnConnect(transport, false);
      setConsumerTransport(transport);
      if (device && producer) {
        const { rtpCapabilities } = device;
        sendMessage({
          type: SFUMessageType.CONSUME,
          payload: { rtpCapabilities },
        });
      }
    }
  };

  const handleSubscribe = async (data: ISubscribedPayload) => {
    if (consumerTransport) {
      const newConsumer = await consumerTransport.consume(data);
      setConsumer(newConsumer);

      const stream = new MediaStream([newConsumer.track]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play();

        if (localStream && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      }
      sendMessage({
        type: SFUMessageType.RESUME,
        payload: { consumerId: data.id },
      });
    }
  };

  const handleProducerClosed = () => {
    if (consumerTransport) {
      consumerTransport.close();
      setConsumerTransport(null);
    }
    if (consumer) {
      consumer.close();
      setConsumer(null);
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = function (event) {
      const message: SFUClientMessageReceived = JSON.parse(event.data);
      switch (message.type) {
        case SFUMessageType.JOIN_ROOM:
          const { rtpCapabilities } = message.payload;
          createDevice(rtpCapabilities);
          break;
        case SFUMessageType.CREATE_PRODUCER_TRANSPORT: {
          handleCreateProducerTransport(message.payload);
          break;
        }
        case SFUMessageType.GET_PRODUCERS: {
          const { producersList } = message.payload;
          producersList.forEach(signalNewConsumerTransport);
          break;
        }
        case SFUMessageType.CREATE_CONSUMER_TRANSPORT: {
          handleCreateConsumerTransport(message.payload);
          break;
        }
        case SFUMessageType.NEW_PRODUCER: {
          signalNewConsumerTransport(message.payload.producerId);
          break;
        }
        case SFUMessageType.SUBSCRIBED: {
          handleSubscribe(message.payload);
          break;
        }
        case SFUMessageType.PRODUCER_CLOSED: {
          handleProducerClosed();
          break;
        }
      }
    };
  }, [socket, device, localStream, producer, consumerTransport, consumer]);

  return { localVideoRef, remoteVideoRef };
};
