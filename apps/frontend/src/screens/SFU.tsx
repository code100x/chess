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
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

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
    console.log('Device RTP Capabilities', device.rtpCapabilities);
    socket?.send(
      JSON.stringify({
        type: 'createProducerTransport',
      }),
    );
  };
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log('remote', remoteStream);
      console.log('remote', remoteVideoRef.current);

      remoteVideoRef.current.play();
    }
  }, [remoteStream]);

  const signalNewConsumerTransport = async (remoteProducerId: string) => {
    //check if we are already consuming the remoteProducerId
    if (consumingTransports.includes(remoteProducerId)) return;
    setConsumingTransports((prev) => [...prev, remoteProducerId]);
    console.log("newConsumerTransport");
    
    socket?.send(
      JSON.stringify({
        type: 'createConsumerTransport',
      }),
    );
  };

  const handleCreateProducerTransport = async (payload: any) => {
    const transport = device?.createSendTransport(payload);
    console.log('transport', transport);
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
            console.log('connected');

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
        console.log('producing', kind);

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

    transport?.on('connectionstatechange', (state) => {
      console.log('state', state);

      switch (state) {
        case 'connecting':
          console.log('connecting....');
          break;
        case 'connected':
          console.log('connected');
          console.log('DSvfswefveswfgwes');

          if (localStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = localStream;
          }

          break;

        case 'failed':
          transport.close();
          console.error('Failed COnnecting');
          break;
        default:
          break;
      }
    });

    try {
      const track = localStream?.getVideoTracks()[0];
      console.log('track', track);

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
    console.log('fdhbrthrthrthrt56transport', transport);
    transport?.on('connect', async ({ dtlsParameters }, callback, errback) => {
      try {
        console.log('sdavfswef');

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

    transport?.on('connectionstatechange', (state) => {
      console.log('state', state);

      switch (state) {
        case 'connecting':
          console.log('connecting....');
          break;
        case 'connected':
          console.log('connected');
          console.log('DSvfswefveswfgwes');

          if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          break;
        case 'failed':
          transport.close();
          console.error('Failed COnnecting');
          break;
        default:
          break;
      }
    });
    if (transport) {
      console.log('Sdvfwesdfvserf');

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
    console.log('sdvsdvs');

    if (consumerTransport) {
      console.log('22333');

      const { producerId, id, rtpParameters, kind } = data;
      console.log('DSavcsdvsdef', kind);

      const consumer = await consumerTransport.consume({
        id,
        producerId,
        kind,
        rtpParameters,
      });

      console.log('ADscfsedfsedwfews', consumer.track);

      const stream = new MediaStream();
      stream.addTrack(consumer.track);
      setRemoteStream(stream);
      
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
        case 'getProducers':{
          const {producerList} = message.payload;
          producerList.filter(signalNewConsumerTransport)
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
  }, [socket, device, localStream, producer, consumerTransport, remoteStream]);

  return (
    <div>
      {/* <video id="1" ref={localVideoRef} autoPlay playsInline muted /> */}
      <video id="2" ref={remoteVideoRef} autoPlay playsInline muted />
    </div>
  );
};

export default SFU;
