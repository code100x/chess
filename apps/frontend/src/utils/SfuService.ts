import {
  Consumer,
  Device,
  Producer,
  Transport,
} from 'mediasoup-client/lib/types';
import SfuMessageDispatcher from './SfuMessageDispatcher';
import { EventEmitter } from 'events';
import { User } from "@repo/store/user";
import { ClientMessageType, CustomAppData, RoomErrorPayload, ServerMessage, ServerMessageType, WebRtcConnectResponsePayload, WebRtcConsumerResponsePayload, WebRtcNewProducerPayload, WebRtcProducerResponsePayload, WebRtcTransportPayload, WebRtcUserDisconnectedPayload } from '@repo/common/sfu';

const SFU_URL = import.meta.env.VITE_APP_SFU_URL ?? 'ws://localhost:8081';


export interface UserConsumer {
  id: string;
  videoConsumer: Consumer<CustomAppData> | null;
  audioConsumer: Consumer<CustomAppData> | null;
}

export class SfuService extends EventEmitter {
  roomId: string;
  webSocket: WebSocket;
  device: Device;
  senderTransport: Transport<CustomAppData> | null;
  receiverTransport: Transport<CustomAppData> | null;
  videoProducer: Producer<CustomAppData> | null;
  audioProducer: Producer<CustomAppData> | null;
  producersToConsume: {id: string, userId: string}[];
  consumers: Map<string, UserConsumer>;
  user: { id: string; token: string; name: string };
  sfuMessageDispatcher: SfuMessageDispatcher;


  constructor(
    roomId: string,
    user: User,
  ) {
    super();
    this.roomId = roomId;
    this.webSocket = new WebSocket(`${SFU_URL}?token=${user.token}`);
    this.device = new Device();
    this.senderTransport = null;
    this.receiverTransport = null;
    this.videoProducer = null;
    this.audioProducer = null;
    this.consumers = new Map();
    this.user = user;
    this.sfuMessageDispatcher = new SfuMessageDispatcher();
    this.producersToConsume = [];
    this.addHandlers();
  }

  static NEW_CONSUMER_EVENT = 'newConsumer'; 
  static CONSUMER_CLOSED_EVENT = 'consumerClosed';
  static TRANSPORT_CONNECTED_EVENT = 'transportConnected';
  

  addHandlers() {
    this.webSocket.onmessage = (event) => {
      this.sfuMessageDispatcher.dispatch(event);
    };
    this.webSocket.onopen = () => {
      console.log('Connected to the server');
      sendMessage(this.webSocket, {
        type: ServerMessageType.JOIN_ROOM,
        payload: {
          roomId: this.roomId,
        },
      });
    };

    this.sfuMessageDispatcher.registerHandler(
      ClientMessageType.WEBRTC_TRANSPORT_INITIALIZE, 
      async (payload: WebRtcTransportPayload) => {
        const { id, iceParameters, iceCandidates, dtlsParameters } =
          payload.sender;

        // Load this device
        await this.device.load({
          routerRtpCapabilities: payload.routerRtpCapabilities,
        });

        const senderTransport = this.device.createSendTransport({
          id,
          iceParameters,
          iceCandidates,
          dtlsParameters,
          appData: {
            userId: this.user.id,
          },
        });

        const receiverTransPort = this.device.createRecvTransport({
          id: payload.receiver.id,
          iceParameters: payload.receiver.iceParameters,
          iceCandidates: payload.receiver.iceCandidates,
          dtlsParameters: payload.receiver.dtlsParameters,
          appData: {
            userId: this.user.id,
          },
        });
        this.producersToConsume = payload.producers; // producers to server as consumers in client
        this.senderTransport = senderTransport;
        this.receiverTransport = receiverTransPort;
        this.setUpSenderTransport();
        this.setUpReceiverTransport();
        this.emit(SfuService.TRANSPORT_CONNECTED_EVENT);
      },
    );

    this.sfuMessageDispatcher.registerHandler(ClientMessageType.ROOM_ERROR, async (payload: RoomErrorPayload) => {
      console.error("Room error", payload.message);
    });



    this.sfuMessageDispatcher.registerHandler(
      ClientMessageType.WEBRTC_NEW_PRODUCER,
      async (payload: WebRtcNewProducerPayload) => {
        try {
          this.producersToConsume.push({
            id: payload.producerId,
            userId: payload.userId,
          });
          const consumer = await this.createSingleConsumer({
            producerId: payload.producerId,
            userId: payload.userId,
          });
          const consumerUserId = consumer.appData.userId as string;
          const userConsumer = this.consumers.get(consumerUserId) ?? {
            id: consumerUserId,
            audioConsumer: null,
            videoConsumer: null,
          };
  
          if (consumer.kind === 'audio') {
            userConsumer.audioConsumer = consumer;
          } else {
            userConsumer.videoConsumer = consumer;
          }
  
          this.consumers.set(consumerUserId, userConsumer);
          this.emit(SfuService.NEW_CONSUMER_EVENT, userConsumer);
        } catch (error) {
          console.error('Failed to create consumer:', error);
        }
      },
    );

    this.sfuMessageDispatcher.registerHandler(
      ClientMessageType.WEBRTC_USER_DISCONNECTED,
      async (payload: WebRtcUserDisconnectedPayload) => {
        const userId = payload.userId as string;
        const userConsumer = this.consumers.get(userId);

        console.log('User disconnected', userId, userConsumer);

        // Close both consumers
        if (userConsumer?.audioConsumer) {
          userConsumer.audioConsumer.close();
        }
        if (userConsumer?.videoConsumer) {
          userConsumer.videoConsumer.close();
        }
        this.consumers.delete(userId);
        this.emit(SfuService.CONSUMER_CLOSED_EVENT, userId);
      },
    );

    this.webSocket.onclose = () => {
      this.cleanUp();
    };
  }

  cleanUp = () => {
    // Close WebSocket connection
    if (this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.close();
    }

    // Stop producer if it exists
    if (this.videoProducer) {
      this.videoProducer.close();
      this.videoProducer = null;
    }

    if (this.audioProducer) {
      this.audioProducer.close();
      this.audioProducer = null;
    }

    // Stop all consumers
    this.consumers.forEach((consumer) => {
      if (consumer.audioConsumer) {
        consumer.audioConsumer.close();
      }
      if (consumer.videoConsumer) {
        consumer.videoConsumer.close();
      }
    });
    this.consumers = new Map();

    // Close sender transport if it exists
    if (this.senderTransport) {
      this.senderTransport.close();
      this.senderTransport = null;
    }

    // Close receiver transport if it exists
    if (this.receiverTransport) {
      this.receiverTransport.close();
      this.receiverTransport = null;
    }
  };

  setUpSenderTransport = async () => {
    if (!this.senderTransport) {
      throw new Error('Sender transport is not created');
    }

    this.senderTransport!.on(
      'connect',
      async ({ dtlsParameters }, callback, errback) => {
        // Here we must communicate our local parameters to our remote transport.
        try {
          sendMessage(this.webSocket, {
            type: ServerMessageType.WEBRTC_CONNECT,
            payload: {
              transportId: this.senderTransport!.id,
              dtlsParameters,
            },
          });
          // Done in the server, tell our transport.
          const deregisterHandler = this.sfuMessageDispatcher.registerHandler(
            ClientMessageType.WEBRTC_TRANSPORT_CONNECT_RESPONSE,
            async (payload: WebRtcConnectResponsePayload) => {
              if (payload.transportId === this.senderTransport!.id) {
                if(payload.success === true) {
                  callback();
                } else {
                  errback(new Error('Failed to connect transport'));
                }
                deregisterHandler();
              } 
            },
          );
        } catch (error) {
          // Something was wrong in server side.
          errback(error as Error);
        }
      },
    );

    this.senderTransport!.on(
      'produce',
      async ({ kind, rtpParameters, appData }, callback, errback) => {  
        try {
          sendMessage(this.webSocket, {
            type: ServerMessageType.WEBRTC_PRODUCER,
            payload: {
              transportId: this.senderTransport!.id,
              kind,
              rtpParameters,
              appData: {
                ...appData,
                userId: this.user.id,
              },
            },
          });
          const deregisterHandler = this.sfuMessageDispatcher.registerHandler(
            ClientMessageType.WEBRTC_PRODUCER_RESPONSE,
            async (payload: WebRtcProducerResponsePayload) => {
              if (payload.transportId === this.senderTransport!.id) {
                if(payload.success) {
                  callback({ id: payload.producerId! });
                } else {
                  errback(new Error('Failed to create producer'));
                }
                deregisterHandler();
              }
            },
          );
        } catch (error) {
          errback(error as Error);
        }
      },
    );
  };

  setUpReceiverTransport = async () => {
    if (!this.receiverTransport) {
      throw new Error('Receiver transport is not created');
    }

    this.receiverTransport!.on(
      'connect',
      async ({ dtlsParameters }, callback, errback) => {
        // Here we must communicate our local parameters to our remote transport
        try {
          sendMessage(this.webSocket, {
            type: ServerMessageType.WEBRTC_CONNECT,
            payload: {
              transportId: this.receiverTransport!.id,
              dtlsParameters,
            },
          });
          // Done in the server, tell our transport.
          const deregisterHandler = this.sfuMessageDispatcher.registerHandler(
            ClientMessageType.WEBRTC_TRANSPORT_CONNECT_RESPONSE,
            async (payload: WebRtcConnectResponsePayload) => {
              if (payload.transportId === this.receiverTransport!.id) {
                if(payload.success === true) {
                  callback();
                } else {
                  errback(new Error('Failed to connect transport'));
                }
                deregisterHandler();
              }
            },
          );      
        } catch (error) {
          // Something was wrong in server side.
          errback(error as Error);
        }
      },
    );
  };

  createProducer = async () => {
    try {
      if (!this.senderTransport) {
        throw new Error('Sender transport is not created');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      const params = {
        encodings: [
          {
            scalabilityMode: 'L1T3'
          }
        ],
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
      };
      try {
        const videoProducer = await this.senderTransport.produce({
          ...params,
          track: videoTrack,
          appData: {
            userId: this.user.id,
          },
        });
        this.videoProducer = videoProducer;
      } catch(err) {
        console.error('Error creating video producer', err);
      }
      
      try {
        const audioProducer = await this.senderTransport.produce({
          track: audioTrack,
          appData: {
            userId: this.user.id,
          },
          
        });
        this.audioProducer = audioProducer;
      } catch (error) {
        console.error('Error creating audio producer', error);
      }

      return {
        videoProducer: this.videoProducer,
        audioProducer: this.audioProducer,
      };
    } catch (error) {
      console.error('Error creating producer', error);
      return {
        videoProducer: this.videoProducer,
        audioProducer: this.audioProducer,
      }
    }
  };

  createConsumer = async () => {
    if (!this.receiverTransport) {
      throw new Error('Receiver transport is not created');
    }
    const consumersPromises = this.producersToConsume.map(
      async (producerInfo) => {
        try {
          const consumer = await this.createSingleConsumer({
            producerId: producerInfo.id,
            userId: producerInfo.userId,
          });
          return {
            userId: producerInfo.userId,
            consumer,
          };
        } catch(error) {
          console.error(`Error creating consumer for ${producerInfo.userId}`, error);
          return {
            userId: producerInfo.userId,
            consumer: null,
          };
        }
      },
    );

    const allConsumers = await Promise.all(consumersPromises);

    allConsumers.forEach((consumerInfo) => {

      const {userId, consumer} = consumerInfo;

      if(!consumer) {
        console.error(`Consumer for ${userId} is Not created`);
      }

      const consumerUserId = userId;

      const userConsumer = this.consumers.get(consumerUserId) ?? {
        id: consumerUserId,
        videoConsumer: null,
        audioConsumer: null,
      };

      if(consumer) {
        if (consumer.kind == 'audio') {
          userConsumer.audioConsumer = consumer;
        } else {
          userConsumer.videoConsumer = consumer;
        }
      }

      this.consumers.set(consumerUserId, userConsumer);
    });

    return this.consumers.values();
  };

  createSingleConsumer = async ({producerId, userId} : {producerId: string,userId:string}) : Promise<Consumer<CustomAppData>> => {
    const consumer = new Promise<Consumer<CustomAppData>>((resolve, reject) => {
      sendMessage(this.webSocket, {
        type: ServerMessageType.WEBRTC_CONSUMER,
        payload: {
          transportId: this.receiverTransport!.id,
          producerId: producerId,
          rtpCapabilities: this.device.rtpCapabilities,
        },
      });

      const deregisterHandler = this.sfuMessageDispatcher.registerHandler(
        ClientMessageType.WEBRTC_CONSUMER_RESPONSE,
        async (payload: WebRtcConsumerResponsePayload) => {
          try {
            if (payload.transportId === this.receiverTransport!.id && payload.producerId === producerId) {
              if(!payload.success || !payload.consumerId || !payload.rtpParameters || !payload.kind) {
                throw new Error('Failed to create consumer');
              }
              const consumer = await this.receiverTransport!.consume({
                id: payload.consumerId,
                producerId: payload.producerId,
                rtpParameters: payload.rtpParameters,
                kind: payload.kind,
                appData: {
                  userId: userId,
                },
              });
              // send ack to sever for resuming consumer on server side 
              sendMessage(this.webSocket, {
                type: ServerMessageType.WEBRTC_RESUME_CONSUMER,
                payload: {
                  consumerId: consumer.id,
                },
              });
              deregisterHandler();
              resolve(consumer);
            }
          } catch (error) {
            reject(error);
            deregisterHandler();
          }
        },
      );

      setTimeout(() => {
        reject(new Error('Consumer creation timeout for ' + producerId + 'for ' + userId));
        deregisterHandler();
      },10000);
    });
    return consumer;
  };
}

function sendMessage(ws: WebSocket, message: ServerMessage) {
  ws.send(JSON.stringify(message));
}