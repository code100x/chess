import {
  AppData,
  Consumer,
  Producer,
  Router,
  WebRtcTransport,
  MediaKind
} from 'mediasoup/node/lib/types';
import User from './User';
import RoomManager from './RoomManager';
import { ClientMessageType, ServerMessageType, ClientMessage, ServerMessage, WebRtcJoinRoom, WebRtcJoinRoomPayload, WebRtcConnectPayload, WebRtcProducerPayload, CustomAppData, WebRtcConsumerPayload, WebRtcResumeConsumerPayload} from '@repo/common/sfu';
import WebSocket from 'ws';

class Room {

  router: Router;

  id: string;

  users: User[];

  transports: WebRtcTransport<CustomAppData>[];
  producers: Producer<CustomAppData>[];
  consumers: Consumer<CustomAppData>[];

  constructor(router: Router, id: string) {
    this.router = router;
    this.users = [];
    this.transports = [];
    this.producers = [];
    this.consumers = [];
    this.id = id;
  }

  async addPeer(user: User) {
    if(this.users.find(u => u.id === user.id)) {
      console.log('User already exists in the room');
      sendMessage(user.ws,{
        type: ClientMessageType.ROOM_ERROR,
        payload: {
          message: 'User already exists in the room',
        }
      });
      return;
    }
    this.addRoomEventHandlers(user);
    // create a transport for each user
    let senderTransport = await this.createWebRtcTransport(user.id);
    let receiverTransport = await this.createWebRtcTransport(user.id);
    const {
      id: senderId,
      iceParameters: senderIceParameters,
      iceCandidates: senderIceCandidates,
      dtlsParameters: senderDtlsParameters,
    } = senderTransport;
    const {
      id: receiverId,
      iceParameters: receiverIceParameters,
      iceCandidates: receiverIceCandidates,
      dtlsParameters: receiverDtlsParameters,
    } = receiverTransport;
    // Send the transport information to the client
    sendMessage(user.ws,{
      type: ClientMessageType.WEBRTC_TRANSPORT_INITIALIZE,
      payload: {
        sender: {
          id: senderId,
          iceParameters: senderIceParameters,
          iceCandidates: senderIceCandidates,
          dtlsParameters: senderDtlsParameters,
        },
        receiver: {
          id: receiverId,
          iceParameters: receiverIceParameters,
          iceCandidates: receiverIceCandidates,
          dtlsParameters: receiverDtlsParameters,
        },
        routerRtpCapabilities: this.router.rtpCapabilities,
        producers: this.producers.map((producer) => {
          return {
            id: producer.id,
            userId: producer.appData.userId,
          };
        }),
      },
    })
    this.transports.push(senderTransport);
    this.transports.push(receiverTransport);
    this.users.push(user);
  }

  addRoomEventHandlers(user: User) {
    console.log('Adding event handlers for user', user.id);
    user.ws.on('message', (data) => {
      const message = JSON.parse(data.toString()) as ServerMessage;
      switch (message.type) {
        case ServerMessageType.WEBRTC_CONNECT:
          this.connectPeer(user, message.payload);
          break;
        case ServerMessageType.WEBRTC_PRODUCER:
          this.initiliseProducer(user, message.payload);
          break;
        case ServerMessageType.WEBRTC_CONSUMER:
          this.initiliseConsumer(user, message.payload);
          break;
        case ServerMessageType.WEBRTC_RESUME_CONSUMER:
          this.resumeConsumer(user, message.payload);
          break;
      }
    });

    user.ws.on('close', () => {
      this.removeUser(user);
    });
  }
  resumeConsumer(user: User, payload: WebRtcResumeConsumerPayload) {
    const consumer = this.consumers.find((c) => c.id === payload.consumerId);
    if (!consumer) {
      sendMessage(user.ws,{
        type: ClientMessageType.WEBRTC_RESUME_CONSUMER_RESPONSE,
        payload: {
          message: 'Consumer not found',
          success: false,
        },
      });
      return;
    }
    consumer.resume();
    sendMessage(user.ws,{
      type: ClientMessageType.WEBRTC_RESUME_CONSUMER_RESPONSE,
      payload: {
        message: 'Consumer resumed',
        success: true,
      },
    });
  }


  async initiliseConsumer(user: User, payload: WebRtcConsumerPayload) {
    try {
      const { transportId, producerId, rtpCapabilities } = payload;
      const consumerTransport = this.transports.find(transport => transport.id === transportId);
      if (!consumerTransport) {
        sendMessage(user.ws,{
          type: ClientMessageType.WEBRTC_CONSUMER_RESPONSE,
          payload: {
            message: 'Transport not found',
            success: false
          },
        });
        return;
      }

      const producer = this.producers.find((p) => p.id === producerId);

      if (!producer) {
        sendMessage(user.ws,{
          type: ClientMessageType.WEBRTC_CONSUMER_RESPONSE,
          payload: {
            message: 'Producer not found',
            success: false
          },
        });
        return;
      }

      const consumer = await consumerTransport.consume({
        producerId,
        rtpCapabilities,
        paused: true,
        appData: {
          userId: producer.appData.userId,
        },
      });

      this.consumers.push(consumer);

      sendMessage(user.ws,{
        type: ClientMessageType.WEBRTC_CONSUMER_RESPONSE,
        payload: {
          consumerId: consumer.id,
          producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          transportId: consumerTransport.id,
          appData: consumer.appData,
          success: true,
        },
      });
    } catch (error) {
      console.error(error);
      sendMessage(user.ws,{
        type: ClientMessageType.WEBRTC_CONSUMER_RESPONSE,
        payload: {
          message: 'Failed to create consumer',
          success: false
        },
      });
    }
  }

  async initiliseProducer(user: User, payload: WebRtcProducerPayload) {
    try {
      const { transportId, kind, rtpParameters, appData } = payload;
      const transport = this.transports.find(transport => transport.id === transportId);
      if (!transport) {
        sendMessage(user.ws,{
          type: ClientMessageType.WEBRTC_PRODUCER_RESPONSE,
          payload: {
            message: 'Transport not found',
            success: false,
            transportId,
          },
        });
        return;
      }

      if (appData && appData.userId !== user.id) {
        console.log('Invalid user id', appData.userId, user.id);
        sendMessage(user.ws,{
          type: ClientMessageType.WEBRTC_PRODUCER_RESPONSE,
          payload: {
            message: 'Invalid user id',
            success: false,
            transportId,
          },
        });
        return;
      }

      // create producer
      const producer = await transport.produce({
        kind: kind as MediaKind,
        rtpParameters,
        appData,
      });
      // send producer id to the client
      sendMessage(user.ws,{
        type: ClientMessageType.WEBRTC_PRODUCER_RESPONSE,
        payload: {
          transportId,
          producerId: producer.id,
          success: true,
        },
      });
      this.producers.push(producer);

      // notify all the clients about the new producer
      this.users.forEach((u) => {
        if (u.id !== user.id) {
          sendMessage(u.ws,{
            type: ClientMessageType.WEBRTC_NEW_PRODUCER,
            payload: {
              userId: user.id,
              producerId: producer.id,
            },
          });
        }
      });
    } catch (error) {
      console.error(error);
      sendMessage(user.ws,{
        type: ClientMessageType.WEBRTC_PRODUCER_RESPONSE,
        payload: {
          message: 'Failed to create producer',
          success: false,
          transportId: payload.transportId,
        },
      });
    }
  }

  connectPeer(user: User, payload: WebRtcConnectPayload) {
    const { transportId, dtlsParameters } = payload;
    const transport = this.transports.find(transport => transport.id === transportId);
    // establish connection between the client and the server
    try {
      if (!transport) {
        throw new Error('Transport not found');
      }
      transport.connect({ dtlsParameters }).then(() => {
        sendMessage(user.ws,{
          type: ClientMessageType.WEBRTC_TRANSPORT_CONNECT_RESPONSE,
          payload: {
            transportId: transport.id,
            success: true,
          },
        });
      });
    } catch (error) {
      console.error(error);
      sendMessage(user.ws,{
        type: ClientMessageType.WEBRTC_TRANSPORT_CONNECT_RESPONSE,
        payload: {
          transportId: transportId,
          success: false,
        },
      });
    }
  }

  async createWebRtcTransport(userId: string) {
    // Server will establish peer to peer connection with each client
    // and hence we need to create a transport for each client
    const transport = await this.router.createWebRtcTransport({
      preferUdp: true,
      listenIps: [
        {
          ip: '127.0.0.1',
          announcedIp: undefined,
        },
      ],
      appData: {
        userId: userId
      }
    });
    return transport;
  }

  removeUser(user: User) {
    this.users = this.users.filter((u) => u.id !== user.id);

    const transportsToRemove = Array.from(this.transports.values()).filter((transport) => {
      return transport.appData.userId === user.id;
    });

    const producersToRemove = this.producers.filter(
      (p) => p.appData.userId === user.id,
    );

    const consumersToRemove = this.consumers.filter(
      (c) => c.appData.userId === user.id,
    );

    // close the producers
    producersToRemove.forEach((prd) => {
      prd.close();
    });

    // close the consumers 
    consumersToRemove.forEach((c) => {
      c.close();
    });

    // close the transports
    transportsToRemove.forEach((t) => {
      // Close the transport and remove it from the map
      t.close();
    });

    // remove the producer from the list
    this.producers = this.producers.filter((p) => p.appData.userId !== user.id);

    // remove the consumers for the user
    this.consumers = this.consumers.filter((c) => c.appData.userId !== user.id);

    // remove the transports for the user
    this.transports = this.transports.filter((t) => t.appData.userId !== user.id);


    // notify all the clients about the removed producer
    this.users.forEach((u) => {
      if (u.id !== user.id) {
        sendMessage(u.ws,{
          type: ClientMessageType.WEBRTC_USER_DISCONNECTED,
          payload: {
            userId: user.id,
          },
        });
      }
    });

    if(this.users.length === 0) {
      console.log('No users left in the room. Closing the room');
      this.router.close();
      RoomManager.getInstance().deleteRoom(this.id);
    }

  }
}

function sendMessage(ws: WebSocket, message: ClientMessage) {
  ws.send(JSON.stringify(message));
}

export default Room;
