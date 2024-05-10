import { useEffect, useRef, useState } from 'react';
import { useSfuSocket } from '../hooks/useSfuSocket';
import * as mediasoupClient from 'mediasoup-client';
import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters';
import { AppData, Producer, Transport } from 'mediasoup-client/lib/types';

const videoParams = {
  // mediasoup params
  encodings: [
    {
      rid: 'r0',
      maxBitrate: 100000,
      scalabilityMode: 'S1T3',
    },
    {
      rid: 'r1',
      maxBitrate: 300000,
      scalabilityMode: 'S1T3',
    },
    {
      rid: 'r2',
      maxBitrate: 900000,
      scalabilityMode: 'S1T3',
    },
  ],
  // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
};

const SFU = () => {
  const { socket, localStream } = useSfuSocket();
  const [device, setDevice] = useState<mediasoupClient.Device | null>(null);

  const [producer, setProducer] = useState<Producer<AppData> | null>(null);
  const [consumingTransports, setConsumingTransports] = useState<string[]>([]);

  const [consumerTransport, setConsumerTransport] =
    useState<Transport<AppData> | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const createDevice = async (routerRtpCapabilities: RtpCapabilities) => {
    const device = new mediasoupClient.Device();
    setDevice(() => device);
    await device.load({
      routerRtpCapabilities,
    });
    socket?.send(
      JSON.stringify({
        type: 'createProducerTransport',
      }),
    );
  };

  const signalNewConsumerTransport = async (remoteProducerId: string) => {
    if (consumingTransports.includes(remoteProducerId)) return;
    setConsumingTransports((prev) => [...prev, remoteProducerId]);
    socket?.send(
      JSON.stringify({
        type: 'createConsumerTransport',
      }),
    );
  };

  const handleCreateProducerTransport = async (payload: any) => {
    const transport = device?.createSendTransport(payload);
    transport?.on('connect', async ({ dtlsParameters }, callback, errback) => {
      try {
        socket?.send(
          JSON.stringify({
            type: 'connectProducerTransport',
            payload: {
              dtlsParameters,
            },
          }),
        );
        socket?.addEventListener('message', (event) => {
          const message = JSON.parse(event.data);

          if (message.type === 'producerConnected') {
            callback();
          }
        });
      } catch (error) {
        errback(error as Error);
      }
    });

    transport?.on(
      'produce',
      async ({ kind, rtpParameters, appData }, callback, errback) => {
        try {
          socket?.send(
            JSON.stringify({
              type: 'produce',
              payload: {
                transportId: transport.id,
                kind,
                rtpParameters,
                appData,
              },
            }),
          );
          socket?.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'produced') {
              callback({ id: message.payload.id });

              socket.send(
                JSON.stringify({
                  type: 'getProducers',
                }),
              );
            }
          });
        } catch (error) {
          console.error('Error', error);
          errback(error as Error);
        }
      },
    );

    try {
      const track = localStream?.getVideoTracks()[0];
      if (track) {
        const producer = await transport?.produce({ track, ...videoParams });
        if (producer) setProducer(producer);
        if (localStream && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateConsumerTransport = async (payload: any) => {
    const transport = device?.createRecvTransport(payload);
    transport?.on('connect', async ({ dtlsParameters }, callback, errback) => {
      try {
        socket?.send(
          JSON.stringify({
            type: 'connectConsumerTransport',
            payload: {
              dtlsParameters,
              transportId: transport.id,
            },
          }),
        );
        socket?.addEventListener('message', (event) => {
          const message = JSON.parse(event.data);

          if (message.type === 'consumerConnected') {
            callback();
          }
        });
      } catch (error) {
        errback(error as Error);
      }
    });
    if (transport) {

      setConsumerTransport(transport);
      if (device && producer) {
        const { rtpCapabilities } = device;
        socket?.send(
          JSON.stringify({
            type: 'consume',
            payload: {
              rtpCapabilities,
            },
          }),
        );
      }
    }
  };

  const handleSubscribe = async (data: any) => {
    if (consumerTransport) {

      const { producerId, id, rtpParameters, kind } = data;

      const consumer = await consumerTransport.consume({
        id,
        producerId,
        kind,
        rtpParameters,
      });

      const stream = new MediaStream([consumer.track]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current?.play();
      }

      socket?.send(
        JSON.stringify({ type: 'resume', payload: { consumerId: id } }),
      );
    }
  };

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = function (event) {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'joinRoom':
          const { rtpCapabilities } = message.payload;
          createDevice(rtpCapabilities);
          break;
        case 'createProducerTransport': {
          handleCreateProducerTransport(message.payload);
          break;
        }
        case 'getProducers': {
          const { producerList } = message.payload;
          producerList.forEach(signalNewConsumerTransport);
          break;
        }
        case 'createConsumerTransport': {
          handleCreateConsumerTransport(message.payload);
          break;
        }
        case 'newProducer': {
          signalNewConsumerTransport(message.payload.producerId);
          break;
        }
        case 'subscribed': {
          handleSubscribe(message.payload);
          break;
        }
      }
    };
  }, [socket, device, localStream, producer, consumerTransport]);

  return (
    <div>
      <video id="1" ref={localVideoRef} autoPlay playsInline muted />
      <video id="2" ref={remoteVideoRef} autoPlay playsInline muted />
    </div>
  );
};

export default SFU;
