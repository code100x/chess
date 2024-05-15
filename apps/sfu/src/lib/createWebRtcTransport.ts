import { Router } from 'mediasoup/node/lib/types';

export const createWebRtcTransport = async (router: Router) => {
  const webRtcTransport_options = {
    listenIps: [
      {
        ip: '0.0.0.0', // replace with relevant IP address
        announcedIp: '127.0.0.1', // replace by public IP address
      },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
  };
  const transport = await router.createWebRtcTransport(webRtcTransport_options);

  transport.on('dtlsstatechange', (dtlsState) => {
    if (dtlsState === 'closed') {
      console.log("closed");
      transport.close();
    }
  });

  const { id, iceParameters, iceCandidates, dtlsParameters } = transport;
  return {
    transport,
    params: {
      id,
      iceParameters,
      iceCandidates,
      dtlsParameters,
    },
  };
};
