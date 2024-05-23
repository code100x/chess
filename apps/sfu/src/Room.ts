import {
  AppData,
  Consumer,
  Producer,
  Router,
  WebRtcTransport,
} from 'mediasoup/node/lib/types';
import User from './User';
import RoomManager from './RoomManager';


class Room {

  router: Router<AppData>;

  id: string;

  users: User[];

  transports: WebRtcTransport<{userId: string}>[];
  producers: Producer<{ userId: string }>[];
  consumers: Consumer<{ userId: string }>[];

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
      user.ws.send(
        JSON.stringify({
          type: 'ROOM_ERROR',
          payload: {
            message: 'User already exists in the room',
            success: false,
          },
        }),
      );
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
    user.ws.send(
      JSON.stringify({
        type: 'WEBRTC_TRANSPORT',
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
      }),
    );
    this.transports.push(senderTransport);
    this.transports.push(receiverTransport);
    this.users.push(user);
  }

  addRoomEventHandlers(user: User) {
    console.log('Adding event handlers for user', user.id);
    user.ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      switch (message.type) {
        case 'LEAVE_ROOM':
          this.removeUser(user);
          break;
        case 'WEBRTC_CONNECT':
          this.connectPeer(user, message.payload);
          break;
        case 'WEBRTC_PRODUCER':
          this.initiliseProducer(user, message.payload);
          break;
        case 'WEBRTC_CONSUMER':
          this.initiliseConsumer(user, message.payload);
          break;
        case 'WEBRTC_LIST_PRODUCERS':
          this.listProducers(user);
          break;
        case 'WEBRTC_RESUME_CONSUMER':
          this.resumeConsumer(user, message.payload);
          break;
      }
      console.log(
        'HERE',
        this.producers.map((p) => {
          return {
            id: p.id,
            appData: p.appData,
          };
        }),
      );
    });

    user.ws.on('close', () => {
      this.removeUser(user);
    });
  }
  resumeConsumer(user: User, payload: any) {
    const consumer = this.consumers.find((c) => c.id === payload.consumerId);
    if (!consumer) {
      user.ws.send(
        JSON.stringify({
          type: 'WEBRTC_RESUME_CONSUMER_RESPONSE',
          payload: {
            message: 'Consumer not found',
            success: false,
          },
        }),
      );
      return;
    }
    consumer.resume();
    user.ws.send(
      JSON.stringify({
        type: 'WEBRTC_RESUME_CONSUMER_RESPONSE',
        payload: {
          message: 'Consumer resumed',
          success: true,
        },
      }),
    );
  }

  listProducers(user: User) {
    user.ws.send(
      JSON.stringify({
        type: 'WEBRTC_PRODUCERS',
        payload: {
          producers: this.producers.map((producer) => {
            return {
              id: producer.id,
              userId: producer.appData.userId,
            };
          }),
        },
      }),
    );
  }

  async initiliseConsumer(user: User, payload: any) {
    try {
      const { transportId, producerId, rtpCapabilities } = payload;
      const consumerTransport = this.transports.find(transport => transport.id === transportId);
      if (!consumerTransport) {
        user.ws.send(
          JSON.stringify({
            type: 'WEBRTC_CONSUMER_RESPONSE',
            payload: {
              message: 'Transport not found',
              success: false
            },
          }),
        );
        return;
      }

      const producer = this.producers.find((p) => p.id === producerId);

      if (!producer) {
        user.ws.send(
          JSON.stringify({
            type: 'WEBRTC_CONSUMER_RESPONSE',
            payload: {
              message: 'Producer not found',
              success: false,
            },
          }),
        );
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

      user.ws.send(
        JSON.stringify({
          type: 'WEBRTC_CONSUMER_RESPONSE',
          payload: {
            consumerId: consumer.id,
            producerId: producerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
            transportId: consumerTransport.id,
            appData: consumer.appData,
            success: true,
          },
        }),
      );
    } catch (error) {
      console.error(error);
      user.ws.send(
        JSON.stringify({
          type: 'WEBRTC_CONSUMER_RESPONSE',
          payload: {
            message: 'Failed to create consumer',
            success: false,
          },
        }),
      );
    }
  }

  async initiliseProducer(user: User, payload: any) {
    try {
      const { transportId, kind, rtpParameters, appData } = payload;
      const transport = this.transports.find(transport => transport.id === transportId);
      if (!transport) {
        user.ws.send(
          JSON.stringify({
            type: 'WEBRTC_PRODUCER_RESPONSE',
            payload: {
              message: 'Transport not found',
              success: false,
            },
          }),
        );
        return;
      }

      if (appData && appData.userId !== user.id) {
        console.log('Invalid user id', appData.userId, user.id);
        user.ws.send(
          JSON.stringify({
            type: 'WEBRTC_PRODUCER_RESPONSE',
            payload: {
              message: 'Invalid user id',
              success: false,
            },
          }),
        );
        return;
      }

      // create producer
      const producer = await transport.produce({
        kind,
        rtpParameters,
        appData,
      });
      // send producer id to the client
      user.ws.send(
        JSON.stringify({
          type: 'WEBRTC_PRODUCER_RESPONSE',
          payload: {
            producerId: producer.id,
            userId: producer.appData.userId,
            transportId,
            success: true,
          },
        }),
      );
      this.producers.push(producer);

      // notify all the clients about the new producer
      this.users.forEach((u) => {
        if (u.id !== user.id) {
          console.log('sending to', user.id);
          u.ws.send(
            JSON.stringify({
              type: 'WEBRTC_NEW_PRODUCER',
              payload: {
                producerId: producer.id,
                userId: producer.appData.userId,
              },
            }),
          );
        }
      });
    } catch (error) {
      console.error(error);
      user.ws.send(
        JSON.stringify({
          type: 'WEBRTC_PRODUCER_RESPONSE',
          payload: {
            message: 'Failed to create producer',
            transportId: payload.transportId,
            success: false,
          },
        }),
      );
    }
  }

  connectPeer(user: User, payload: any) {
    const { transportId, dtlsParameters } = payload;
    const transport = this.transports.find(transport => transport.id === transportId);
    // establish connection between the client and the server
    try {
      if (!transport) {
        throw new Error('Transport not found');
      }
      transport.connect({ dtlsParameters }).then(() => {
        user.ws.send(
          JSON.stringify({
            type: 'WEBRTC_CONNECT_RESPONSE',
            payload: {
              transportId,
              success: true,
            },
          }),
        );
      });
    } catch (error) {
      console.error(error);
      user.ws.send(
        JSON.stringify({
          type: 'WEBRTC_CONNECT_RESPONSE',
          payload: {
            message: 'Failed to connect to client',
            transportId,
            success: false,
          },
        }),
      );
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

    console.log(
      'Removing producers',
      `User ${user.id} disconnected. Removing ${producersToRemove.length} producers`,
      producersToRemove.map((p) => {
        return {
          id: p.id,
          appData: p.appData,
        };
      }),
      consumersToRemove.map((c) => {
        return {
          id: c.id,
          appData: c.appData,
        };
      }),
      transportsToRemove.map((t) => {
        return {
          id: t.id,
          appData: t.appData,
        };
      })
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
        u.ws.send(
          JSON.stringify({
            type: 'WEBRTC_USER_DISCONNECTED',
            payload: {
              userId: user.id,
            },
          }),
        );
      }
    });

    if(this.users.length === 0) {
      console.log('No users left in the room. Closing the room');
      this.router.close();
      RoomManager.getInstance().deleteRoom(this.id);
    }

  }
}

export default Room;
