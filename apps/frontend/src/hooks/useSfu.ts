import { useEffect, useRef, useState } from 'react';
import { SfuService, UserConsumer } from '../utils/SfuService';
import { Producer } from 'mediasoup-client/lib/types';
import { User } from '../../../../packages/store/src/atoms/user';

export const useSfu = (
  roomId: string,
  user: User | null,
) => {

  const sfuService = useRef<SfuService | null>(null);
  const [videoProducer, setVideoProducer] = useState<Producer>();
  const [audioProducer, setAudioProducer] = useState<Producer>();
  const [consumers, setConsumers] = useState<UserConsumer[]>([]);

  const handleNewConsumer = (consumer: UserConsumer) => {
    setConsumers((prevConsumers) => [
      ...prevConsumers.filter((c) => c.id !== consumer.id),
      consumer,
    ]);
  };

  const handleConsumerClosed = (userId: string) => {
    setConsumers((prevConsumers) => {
        const new_consumers = prevConsumers.filter((consumer) => consumer.id !== userId);
        return new_consumers;
    });
  };

  const handleTransportConnected = () => {
    startConsuming();
    startProducing();
  }

  useEffect(() => {

    if(!roomId || !user) {
        console.error('RoomId or User not provided');
        return;
    }

    if (!sfuService.current) {
      sfuService.current = new SfuService(roomId, user);
    }

    sfuService.current.on(SfuService.NEW_CONSUMER_EVENT, handleNewConsumer);
    sfuService.current.on(SfuService.CONSUMER_CLOSED_EVENT, handleConsumerClosed);
    sfuService.current.on(SfuService.TRANSPORT_CONNECTED_EVENT, handleTransportConnected);

    return () => {
      if (sfuService.current) {
        console.log('CALLED CLOSE');
        sfuService.current.cleanUp();
        sfuService.current.off(SfuService.NEW_CONSUMER_EVENT, handleNewConsumer);
        sfuService.current.off(SfuService.CONSUMER_CLOSED_EVENT, handleConsumerClosed);
        sfuService.current.off(SfuService.TRANSPORT_CONNECTED_EVENT,handleTransportConnected);
        sfuService.current = null;
      }
    };
  }, [roomId, user ? user.token : undefined]);


  const startProducing = async () => {
    if (!sfuService.current) {
      console.error('Sfu Service not initialized');
      return;
    }
    try {
      const { audioProducer, videoProducer } =
        await sfuService.current.createProducer();
      if (audioProducer) {
        setAudioProducer(audioProducer);
      }
      if (videoProducer) {
        setVideoProducer(videoProducer);
      }
    } catch (error) {
      console.error('Error creating producer', error);
    }
  };

  const startConsuming = async () => {
    if (!sfuService.current) return;
    const consumer = await sfuService.current.createConsumer();
    setConsumers([...consumer]);
  };

  return {
    videoProducer,
    audioProducer,
    consumers,
  };
};
