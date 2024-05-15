import {
  IProducePayload,
  SFUMessageType,
  SFUServerMessageReceived,
} from '@repo/common/types';
import { Peer } from './Peer';
import { Room } from './Room';
import { WebSocket } from 'ws';
import {
  AppData,
  DtlsParameters,
  Router,
  Worker,
} from 'mediasoup/node/lib/types';
import { mediaCodecs } from './config/mediaCodecs';
import { sendMessage } from './lib/socket';
import { createWebRtcTransport } from './lib/createWebRtcTransport';
import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters';

export class RoomManager {
  private rooms: Room[];
  private peers: Peer[];
  private peerRoomMapping: Map<string, Room>;
  private worker: Worker<AppData> | null = null;

  constructor() {
    this.rooms = [];
    this.peers = [];
    this.peerRoomMapping = new Map<string, Room>();
  }

  addPeer(peer: Peer, worker: Worker<AppData>) {
    
    this.peers.push(peer);
    
    
    this.worker = worker;
    this.socketHandler(peer);
  }

  removePeer(socket: WebSocket) {
    const peer = this.peers.find((peer) => peer.socket === socket);
    if (!peer) {
      console.error('peer not found?');
      return;
    }
    this.peers = this.peers.filter((peer) => peer.socket !== socket);
    
    this.removePeerFromRoom(peer);
  }

  removePeerFromRoom(peer: Peer) {
    const room = this.getRoom(peer.peerId);
    if (!room) {
      return;
    }
    if (room.peer1 && room.peer2) {
      if (room.peer1.peerId === peer.peerId) {
        room.peer1 = room.peer2;
        room.peer2 = null;
      } else {
        room.peer2 = null;
      }
    } else {
      this.removeRoom(room.roomId);
    }
    room.clear(peer.peerId);
    this.peerRoomMapping.delete(peer.peerId);
  }

  removeRoom(roomId: string) {
    this.rooms = this.rooms.filter((r) => r.roomId !== roomId);
  }

  getRoom(peerId: string) {
    const room = this.peerRoomMapping.get(peerId);
    if (!room) {
      console.error('Could not find room');
      return;
    }
    return room;
  }

  private async onJoinRoom(ws: WebSocket, peer: Peer, roomId: string) {
    
    if (!this.worker) {
      console.error('Worker not found');
      return;
    }
    let router: Router<AppData>;
    let room = this.rooms.find((r) => r.roomId === roomId);
    if (room) {
      if (room.peer1 && room.peer2) {
        sendMessage(ws, {
          type: SFUMessageType.ROOM_FULL,
          payload: { message: 'Cannot join room, already full' },
        });
        return;
      }
      router = room.router;
      room.addSecondPeer(peer);
    } else {
      router = await this.worker.createRouter({ mediaCodecs });
      room = new Room(roomId, peer, router);
      this.rooms.push(room);
    }
    this.peerRoomMapping.set(peer.peerId, room);
    sendMessage(ws, {
      type: SFUMessageType.JOIN_ROOM,
      payload: { rtpCapabilities: router.rtpCapabilities },
    });
  }

  private async onCreateProducerTransport(ws: WebSocket, peerId: string) {
    const room = this.getRoom(peerId);
    if (!room) {
      return;
    }
    try {
      const { transport, params } = await createWebRtcTransport(room.router);
      sendMessage(ws, {
        type: SFUMessageType.CREATE_PRODUCER_TRANSPORT,
        payload: { params },
      });
      room.addProducerTransport(transport, peerId);
    } catch (err) {
      console.error(err);
    }
  }

  private async onConnectProducerTransport(
    ws: WebSocket,
    peerId: string,
    dtlsParameters: DtlsParameters,
  ) {

    
    const transport = this.getRoom(peerId)?.getProducerTransport(peerId);
    if (transport) {

      await transport.connect({ dtlsParameters });

      
      sendMessage(ws, {
        type: SFUMessageType.PRODUCER_CONNECTED,
        payload: { message: 'Producer Connected' },
      });
    }
  }
  private async onConnectConsumerTransport(
    ws: WebSocket,
    peerId: string,
    dtlsParameters: DtlsParameters,
  ) {
    const transport = this.getRoom(peerId)?.getConsumerTransport(peerId);
    if (transport) {
      await transport.connect({ dtlsParameters });
      sendMessage(ws, {
        type: SFUMessageType.CONSUMER_CONNECTED,
        payload: { message: 'Consumer Connected' },
      });
    }
  }

  private async onCreateConsumerTransport(ws: WebSocket, peerId: string) {
    const room = this.getRoom(peerId);
    if (!room) {
      return;
    }
    const { transport, params } = await createWebRtcTransport(room.router);
    sendMessage(ws, {
      type: SFUMessageType.CREATE_CONSUMER_TRANSPORT,
      payload: { params },
    });
    room.addConsumerTransport(transport, peerId);
  }

  private onGetProducers(ws: WebSocket, peerId: string) {
    const room = this.getRoom(peerId);
    if (!room) {
      return;
    }
    const producers = room.getProducers();
    const producersList = producers
      .filter(({ peerId: id }) => peerId !== id)
      .map(({ producer }) => producer.id);

    sendMessage(ws, {
      type: SFUMessageType.GET_PRODUCERS,
      payload: { producersList },
    });
  }

  private async onProduce(
    ws: WebSocket,
    peerId: string,
    payload: IProducePayload,
  ) {
    const room = this.getRoom(peerId);
    if (!room) {
      return;
    }
    const producers = room.getProducers();
    const transport = room.getProducerTransport(peerId);
    if (transport) {
      const producer = await transport.produce(payload);
      sendMessage(ws, {
        type: SFUMessageType.PRODUCED,
        payload: {
          id: producer.id,
          producersExist: !!producers && producers.length > 1,
        },
      });
      room.addProducer(producer, peerId);
      room.informConsumers(peerId);

      producer.on('transportclose', () => {
        producer.close();
      });
    }
  }

  private async onResume(ws: WebSocket, peerId: string, consumerId: string) {
    const room = this.getRoom(peerId);
    if (!room) {
      return;
    }
    const consumers = room.getConsumers();
    const consumer = consumers.find(
      (c) => c.consumer.id === consumerId,
    )?.consumer;
    if (consumer) {
      await consumer.resume();
    }
  }

  private async onConsume(
    ws: WebSocket,
    peerId: string,
    rtpCapabilities: RtpCapabilities,
  ) {
    const room = this.getRoom(peerId);
    if (!room) {
      return;
    }
    const producers = room.getProducers();
    const remoteProducerId = producers.filter(
      ({ peerId: id }) => peerId !== id,
    )[0]?.producer.id;

    if (!remoteProducerId) {
      console.log('No Remote Producer Found');
      return;
    }
    const router = room.router;
    if (
      router.canConsume({
        producerId: remoteProducerId,
        rtpCapabilities,
      })
    ) {
      try {
        const consumerTransport = room.getConsumerTransport(peerId);
        if (consumerTransport) {
          const consumer = await consumerTransport.consume({
            producerId: remoteProducerId,
            rtpCapabilities,
            paused: true,
          });

          consumer.on('producerclose', () => {
            sendMessage(ws, {
              type: SFUMessageType.PRODUCER_CLOSED,
              payload: { remoteProducerId },
            });
            consumerTransport.close();
            room.removeConsumerTransport(consumerTransport.id);
            consumer.close();
            room.removeConsumer(consumer.id);
          });

          sendMessage(ws, {
            type: SFUMessageType.SUBSCRIBED,
            payload: {
              producerId: remoteProducerId,
              id: consumer.id,
              rtpParameters: consumer.rtpParameters,
              kind: consumer.kind,
              type: consumer.type,
              producerPaused: consumer.producerPaused,
            },
          });
          room.addConsumer(consumer, peerId);
        }
      } catch (error) {
        console.error('error', error);
      }
    }
  }

  private socketHandler(peer: Peer) {
    const { socket, peerId } = peer;
    peer.socket.on('message', async (data) => {
      
      const message: SFUServerMessageReceived = JSON.parse(data.toString());

      
      switch (message.type) {
        case SFUMessageType.JOIN_ROOM: {
          this.onJoinRoom(socket, peer, message.payload.roomId);
          break;
        }
        case SFUMessageType.CREATE_PRODUCER_TRANSPORT: {
          this.onCreateProducerTransport(socket, peerId);
          break;
        }
        case SFUMessageType.CONNECT_PRODUCER_TRANSPORT: {
          this.onConnectProducerTransport(
            socket,
            peerId,
            message.payload.dtlsParameters,
          );
          break;
        }
        case SFUMessageType.PRODUCE: {
          this.onProduce(socket, peerId, message.payload);
          break;
        }

        case SFUMessageType.CREATE_CONSUMER_TRANSPORT: {
          this.onCreateConsumerTransport(socket, peerId);
          break;
        }
        case SFUMessageType.CONNECT_CONSUMER_TRANSPORT: {
          this.onConnectConsumerTransport(
            socket,
            peerId,
            message.payload.dtlsParameters,
          );
          break;
        }
        case SFUMessageType.GET_PRODUCERS: {
          this.onGetProducers(socket, peerId);
          break;
        }
        case SFUMessageType.RESUME: {
          this.onResume(socket, peerId, message.payload.consumerId);
          break;
        }
        case SFUMessageType.CONSUME: {
          this.onConsume(socket, peerId, message.payload.rtpCapabilities);
          break;
        }
        default:
          break;
      }
    });
  }
}
