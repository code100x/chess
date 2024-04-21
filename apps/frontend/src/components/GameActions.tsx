import { Flag, Handshake } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export function GameActions() {
  return (
    <div className="flex justify-center gap-5">
      <button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <button onClick={() => console.log('Flag clicked')}>
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
            <button onClick={() => console.log('Handshake clicked')}>
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
