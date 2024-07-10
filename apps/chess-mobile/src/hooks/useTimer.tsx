import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { GAME_TIME } from '~/constants';
import getTimeString from '~/lib/getTimeString';
import { blackTimeConsumed, whiteTimeConsumed } from '~/store/atoms';

export const useTimer = (isBlack: boolean) => {
  const timeConsumed = useRecoilValue(isBlack ? blackTimeConsumed : whiteTimeConsumed);

  const timer = useCallback(() => getTimeString(GAME_TIME - timeConsumed), [timeConsumed]);
  return timer;
};
