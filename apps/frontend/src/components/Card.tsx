import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import chessIcon from '../../public/chess.png';
import computerIcon from '../../public/computer.png';
import lightningIcon from '../../public/lightning-bolt.png';
import friendIcon from '../../public/friendship.png';
import tournamentIcon from '../../public/trophy.png';
import variantsIcon from '../../public/strategy.png';

export function PlayCard() {
  const navigate = useNavigate();
  return (
    <Card className="bg-transparent border-none">
      <CardHeader className="pb-3 text-center text-white shadow-md">
        <CardTitle className="font-semibold tracking-wide flex flex-col items-center justify-center">
          <p>
            Play
            <span className="text-green-700 font-bold pt-1"> Chess</span>
          </p>
          <img className="pl-1 w-1/2 mt-4" src={chessIcon} alt="chess" />
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 cursor-pointer shadow-md mt-1">
        <div
          onClick={() => {
            navigate('/game/random');
          }}
          className="-mx-2 mt-1 bg-stone-800 flex items-start space-x-4 rounded-sm p-2 transition-all hover:bg-stone-700 hover:text-accent-foreground shadow-lg"
        >
          <img
            src={lightningIcon}
            className="inline-block mt-1 h-7 w-7"
            alt="online"
          />
          <div className="space-y-1">
            <p className="text-sm pt-1 font-medium leading-none text-slate-200">
              Play Online
            </p>
            <p className="text-xs pt-2 text-muted-foreground">
              Play vs a Person of Similar Skill
            </p>
          </div>
        </div>

        <div className="-mx-2 mt-1 bg-stone-800 flex items-start space-x-4 rounded-sm p-2 transition-all shadow-lg">
          <img
            src={computerIcon}
            className="inline-block mt-1 h-7 w-7"
            alt="computer"
          />
          <div className="space-y-1">
            <p className="text-sm pt-1 font-medium leading-none text-slate-200">
              Computer
            </p>
            <p className="text-xs pt-2 text-muted-foreground">
              Challenge a bot from easy to master
            </p>
            <p className="text-xs text-red-500 font-semibold">
              Coming Soon ...
            </p>
          </div>
        </div>

        <div className="-mx-2 mt-1 bg-stone-800 flex items-start space-x-4 rounded-sm p-2 transition-all shadow-lg">
          <img
            src={friendIcon}
            className="inline-block mt-1 h-7 w-7"
            alt="friend"
          />
          <div className="space-y-1">
            <p className="text-sm pt-1 font-medium leading-none text-slate-200">
              Play a Friend
            </p>
            <p className="text-xs pt-2 text-muted-foreground">
              Invite a Friend to a game of Chess
            </p>
            <p className="text-xs text-red-500 font-semibold">
              Coming Soon ...
            </p>
          </div>
        </div>

        <div className="-mx-2 mt-1 bg-stone-800 flex items-start space-x-4 rounded-sm p-2 transition-all shadow-lg">
          <img
            src={tournamentIcon}
            className="inline-block mt-1 h-7 w-7"
            alt="tournament"
          />
          <div className="space-y-1">
            <p className="text-sm pt-1 font-medium leading-none text-slate-200">
              Tournaments
            </p>
            <p className="text-xs pt-2 text-muted-foreground">
              Join an Arena where anyone can Win
            </p>
            <p className="text-xs text-red-500 font-semibold">
              Coming Soon ...
            </p>
          </div>
        </div>

        <div className="-mx-2 mt-1 bg-stone-800 flex items-start space-x-4 rounded-sm p-2 transition-all shadow-lg">
          <img
            src={variantsIcon}
            className="inline-block mt-1 h-7 w-7"
            alt="variants"
          />
          <div className="space-y-1">
            <p className="text-sm pt-1 font-medium leading-none text-slate-200">
              Chess Variants
            </p>
            <p className="text-xs pt-2 text-muted-foreground">
              Find Fun New ways to play chess
            </p>
            <p className="text-xs text-red-500 font-semibold">
              Coming Soon ...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
