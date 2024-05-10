import { WebSocketServer, WebSocket } from 'ws';
import url from 'url';
import { extractUserId } from './auth';
import {
  Consumer,
  MediaKind,
  Producer,
  Router,
  RtpCodecCapability,
  WebRtcTransport,
  Worker,
} from 'mediasoup/node/lib/types';
import { createWorker } from './lib/worker';
import { createWebRtcTransport } from './lib/createWebRtcTransport';

const wss = new WebSocketServer({ port: 8081 });

let worker: Worker;
let rooms: any = {}; // { roomName1: { Router, rooms: [ sicketId1, ... ] }, ...}
let peers: Record<string, any> = {}; // { socketId1: { roomName1, socket, transports = [id1, id2,] }, producers = [id1, id2,] }, consumers = [id1, id2,], peerDetails }, ...}
let producerTransports: any[] = []; // [ { socketId1, roomName1, transport, consumer }, ... ]
let consumerTransports: any[] = [];
let producers: any[] = []; // [ { socketId1, roomName1, producer, }, ... ]
let consumers: any[] = [];
const mediaCodecs = [
  {
    kind: 'audio' as MediaKind,
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video' as MediaKind,
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,
    },
  },
] as RtpCodecCapability[];

const send = (ws: WebSocket, type: string, payload: any) => {
  ws.send(
    JSON.stringify({
      type,
      payload,
    }),
  );
};

async function main() {
  worker = await createWorker();
}

main();

wss.on('connection', function connection(ws, req) {
  //@ts-ignore
  const token: string = url.parse(req.url, true).query.token;
  const userId = extractUserId(token);

  const removeItems = (items: any[], userId: string, type: string) => {
    items.forEach((item) => {
      if (item.userId === userId) {
        item[type].close();
      }
    });
    items = items.filter((item) => item.userId !== userId);
    return items;
  };

  ws.on('close', () => {
    // do some cleanup
    consumers = removeItems(consumers, userId, 'consumer');
    producers = removeItems(producers, userId, 'producer');
    producerTransports = removeItems(producerTransports, userId, 'transport');

    const { roomName } = peers[userId];
    delete peers[userId];
    rooms[roomName] = {
      router: rooms[roomName].router,
      peers: rooms[roomName].peers.filter((userId: any) => userId !== userId),
    };
  });

  const addProducerTransport = (
    transport: WebRtcTransport,
    roomName: string,
  ) => {
    producerTransports = [
      ...producerTransports,
      { userId, transport, roomName },
    ];

    peers[userId] = {
      ...peers[userId],
      transports: [...peers[userId].transports, transport.id],
    };
  };
  const addConsumerTransport = (
    transport: WebRtcTransport,
    roomName: string,
  ) => {
    consumerTransports = [
      ...consumerTransports,
      { userId, transport, roomName },
    ];

    peers[userId] = {
      ...peers[userId],
      transports: [...peers[userId].transports, transport.id],
    };
  };

  const addProducer = (producer: Producer, roomName: string) => {
    producers = [...producers, { userId, producer, roomName }];

    peers[userId] = {
      ...peers[userId],
      producers: [...peers[userId].producers, producer.id],
    };
  };

  const addConsumer = (consumer: Consumer, roomName: string) => {
    // add the consumer to the consumers list
    consumers = [...consumers, { userId, consumer, roomName }];

    // add the consumer id to the peers list
    peers[userId] = {
      ...peers[userId],
      consumers: [...peers[userId].consumers, consumer.id],
    };
  };
  const getRemoteProducer = () => {
    const [producerTransport] = producers.filter(
      (producer) => producer.userId !== userId,
    );
    return producerTransport.producer;
  };

  const getRouter = () => {
    const roomName = peers[userId].roomName;
    const router = rooms[roomName].router;
    return router;
  };

  const getProducerTransport = () => {
    const [producerTransport] = producerTransports.filter(
      (transport) => transport.userId === userId,
    );
    return producerTransport.transport;
  };
  const getConsumerTransport = () => {
    const [consumerTransport] = consumerTransports.filter(
      (transport) => transport.userId === userId,
    );
    return consumerTransport.transport;
  };

  ws.on('message', async function message(data: any) {
    const message = JSON.parse(data);
    switch (message.type) {
      case 'joinRoom': {
        const { roomName } = message.payload;
        const router = await createRoom(roomName, userId);
        peers[userId] = {
          ws,
          roomName: roomName,
          transports: [],
          producers: [],
          consumers: [],
        };

        const rtpCapabilities = router.rtpCapabilities;
        ws.send(
          JSON.stringify({ type: 'joinRoom', payload: { rtpCapabilities } }),
        );
        break;
      }
      case 'createProducerTransport': {
        const roomName = peers[userId].roomName;
        const router = rooms[roomName].router;
        try {
          const { transport, params } = await createWebRtcTransport(router);
          send(ws, 'createProducerTransport', params);
          addProducerTransport(transport, roomName);
        } catch (err) {
          console.log(console.error(err));
        }
        break;
      }
      case 'connectProducerTransport': {
        const { dtlsParameters } = message.payload;

        await getProducerTransport().connect({ dtlsParameters });

        send(ws, 'producerConnected', 'Producer Connected');
        break;
      }
      case 'produce': {
        const { kind, rtpParameters, appData } = message.payload;
        const producer = await getProducerTransport().produce({
          kind,
          rtpParameters,
          appData,
        });
        send(ws, 'produced', {
          id: producer.id,
          producersExist: producers.length > 1,
        });
        const { roomName } = peers[userId];
        addProducer(producer, roomName);
        informConsumers(roomName, userId, producer.id);
        break;
      }

      case 'createConsumerTransport': {
        const roomName = peers[userId].roomName;
        const router = rooms[roomName].router;

        const { transport, params } = await createWebRtcTransport(router);
        send(ws, 'createConsumerTransport', params);
        addConsumerTransport(transport, roomName);
        break;
      }
      case 'connectConsumerTransport': {
        const { dtlsParameters } = message.payload;

        await getConsumerTransport().connect({ dtlsParameters });

        send(ws, 'consumerConnected', 'Producer Connected');
        break;
      }
      case 'getProducers': {
        const { roomName } = peers[userId];

        let producerList: any[] = [];
        producers.forEach((producerData) => {
          if (
            producerData.userId !== userId &&
            producerData.roomName === roomName
          ) {
            producerList = [...producerList, producerData.producer.id];
          }
        });

        send(ws, 'getProducers', { producerList });
        break;
      }
      case 'resume': {
        const { consumerId } = message.payload;
        const { consumer } = consumers.find(
          (consumerData) => consumerData.consumer.id === consumerId,
        );
        await consumer.resume();
        break;
      }
      case 'consume': {
        const { rtpCapabilities } = message.payload;
        const { id, kind } = getRemoteProducer();
        const roomName = peers[userId].roomName;
        const router = getRouter();
        if (
          !router.canConsume({
            producerId: id,
            rtpCapabilities,
          })
        ) {
          console.error('can not consumer');
        }

        try {
          const consumer: Consumer = await getConsumerTransport().consume({
            producerId: id,
            rtpCapabilities,
            paused: true,
          });

          send(ws, 'subscribed', {
            producerId: id,
            id: consumer.id,
            rtpParameters: consumer.rtpParameters,
            kind: consumer.kind,
            type: consumer.type,
            producerPaused: consumer.producerPaused,
          });
          addConsumer(consumer, roomName);
        } catch (error) {
          console.error('error', error);
        }

        break;
      }
      default:
        break;
    }
  });
});

const createRoom = async (roomName: string, userId: string) => {
  let router1: Router;
  let peers = [];
  if (rooms[roomName]) {
    router1 = rooms[roomName].router;
    peers = rooms[roomName].peers || [];
  } else {
    router1 = await worker.createRouter({ mediaCodecs });
  }

  rooms[roomName] = {
    router: router1,
    peers: [...peers, userId],
  };

  return router1;
};

const informConsumers = (roomName: string, userId: string, id: string) => {
  producers.forEach((producerData) => {
    if (producerData.userId !== userId && producerData.roomName === roomName) {
      const producerSocket = peers[producerData.userId].ws;
      producerSocket.send(
        JSON.stringify({
          type: 'newProducer',
          payload: {
            producerId: id,
          },
        }),
      );
    }
  });
};
