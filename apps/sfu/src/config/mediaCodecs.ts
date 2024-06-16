import {
  MediaKind,
  RtpCodecCapability,
} from 'mediasoup/node/lib/RtpParameters';

export const mediaCodecs = [
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
