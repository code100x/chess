process.env.DEBUG = "mediasoup*"
import * as mediasoup from 'mediasoup';

export const createWorker = async () => {
    const worker = await mediasoup.createWorker({
      rtcMinPort: 2000,
      rtcMaxPort: 2020,
    });
  
    worker.on('died', (error) => {
      console.error('mediasoup worker has died');
      setTimeout(() => process.exit(1), 2000);
    });
  
    return worker;
};

