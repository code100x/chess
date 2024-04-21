import { Flag, Handshake } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { OFFER_DRAW, RESIGN } from '../screens/Game';
import { Button } from './ui/button';

type GameActionsProps = {
  socket?: WebSocket;
  gameId: string;
  myColor: 'black' | 'white';
  myId: string;
};

export function GameActions({
  socket,
  gameId,
  myColor,
  myId,
}: GameActionsProps) {
  const handleDrawClick = () => {
    if (!socket) return;

    socket.send(
      JSON.stringify({
        type: OFFER_DRAW,
        payload: {
          gameId,
          myColor,
          myId,
        },
      }),
    );
  };

  const handleResignClick = () => {
    if (!socket) return;

    socket.send(
      JSON.stringify({
        type: RESIGN,
        payload: {
          gameId,
          myColor,
        },
      }),
    );
  };

  return (
    <>
      <div className="flex justify-center gap-5">
        <button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button onClick={handleResignClick}>
                  <Flag className="text-white" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-black">
                <p className="text-white">Resign</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="text-white">
              <Button
                onClick={handleDrawClick}
                className="flex gap-1 items-center"
              >
                <span>Offer Draw</span>
                <Handshake className="text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-black">
              <p className="text-white">Offer Draw</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {/* TODO: Add Undo Feature */}
      </div>
    </>
  );
}
