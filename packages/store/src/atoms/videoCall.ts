import { atom } from 'recoil';

type TVideoCallRequestStatusAtom = 'Pending' | 'Locked' | 'Idle' | 'Accepted';

export const videoCallRequestStatusAtom = atom<TVideoCallRequestStatusAtom>({
  key: 'videoCallRequestStatusAtom',
  default: 'Idle',
});
