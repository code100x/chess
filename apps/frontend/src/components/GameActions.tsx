import { Flag, Handshake } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { RESIGN } from '../screens/Game';

type GameActionsProps = {
  socket?: WebSocket;
  gameId: string;
  myColor: 'black' | 'white';
};

export function GameActions({ socket, gameId, myColor }: GameActionsProps) {
  // TODO: Implement this
  const handleDrawClick = () => {};

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
          <TooltipTrigger>
            <button onClick={handleDrawClick}>
              <Handshake className="text-white" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-black">
            <p className="text-white">Offer Draw</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* TODO: Add Undo Feature */}
    </div>
  );
}
