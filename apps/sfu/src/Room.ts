import { randomUUID } from 'crypto';
import { Router } from 'mediasoup/node/lib/Router';
import {
  AppData,
  Consumer,
  Transport,
  Producer,
} from 'mediasoup/node/lib/types';
import { Peer } from './Peer';
import { sendMessage } from './lib/socket';
import { SFUMessageType } from '@repo/common/types';

interface ITransport {
  peerId: string;
  transport: Transport;
}
interface IProducer {
  peerId: string;
  producer: Producer;
}
interface IConsumer {
  peerId: string;
  consumer: Consumer;
}

export class Room {
  public roomId: string;
  public router: Router<AppData>;
  public peer1: Peer;
  public peer2: Peer | null = null;
  private producerTransports: ITransport[] = [];
  private consumerTransports: ITransport[] = [];
  private producers: IProducer[] = [];
  private consumers: IConsumer[] = [];

  constructor(roomId: string, peer1: Peer, router: Router<AppData>) {
    this.roomId = roomId;
    this.peer1 = peer1;
    this.router = router;
  }

  removeItems<T extends { peerId: string }>(
    items: T[],
    peerId: string,
    type: keyof T,
  ) {
    items.forEach((item) => {
      if (item.peerId === peerId) {
        (item[type] as Consumer | Producer | Transport).close();
      }
    });
    items = items.filter((item) => item.peerId !== peerId);
    return items;
  }

  clear(peerId: string) {
    this.consumerTransports = this.removeItems(
      this.consumerTransports,
      peerId,
      'transport',
    );
    this.producerTransports = this.removeItems(
      this.producerTransports,
      peerId,
      'transport',
    );
    this.consumers = this.removeItems(this.consumers, peerId, 'consumer');
    this.producers = this.removeItems(this.producers, peerId, 'producer');
  }

  addSecondPeer(peer2: Peer) {
    this.peer2 = peer2;
  }

  addProducerTransport(transport: Transport, peerId: string) {
    this.producerTransports.push({ peerId, transport });
  }

  addConsumerTransport(transport: Transport, peerId: string) {
    this.consumerTransports.push({ peerId, transport });
  }

  getProducerTransport(peerId: string) {
    console.log('this', this.producerTransports.length);

    return this.producerTransports.find((t) => {
      return t.peerId === peerId;
    })?.transport;
  }
  getConsumerTransport(peerId: string) {
    return this.consumerTransports.find((t) => t.peerId === peerId)?.transport;
  }

  getProducers() {
    return this.producers;
  }
  getConsumers() {
    return this.consumers;
  }

  addProducer(producer: Producer, peerId: string) {
    this.producers.push({ producer, peerId });
  }
  addConsumer(consumer: Consumer, peerId: string) {
    this.consumers.push({ consumer, peerId });
  }

  removeConsumerTransport(transportId: string) {
    this.consumerTransports = this.consumerTransports.filter(
      ({ transport: { id } }) => id !== transportId,
    );
  }

  removeConsumer(consumerId: string) {
    this.consumers = this.consumers.filter(
      ({ consumer: { id } }) => id !== consumerId,
    );
  }

  informConsumers(peerId: string) {
    this.producers.forEach(({ producer: { id }, peerId }) => {
      const consumer =
        peerId === this.peer1.peerId
          ? this.peer2
          : peerId === this.peer2?.peerId
            ? this.peer1
            : null;

      if (consumer) {
        sendMessage(consumer.socket, {
          type: SFUMessageType.NEW_PRODUCER,
          payload: {
            producerId: id,
          },
        });
      }
    });
  }
}
