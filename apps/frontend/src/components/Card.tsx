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
import GameModeComponent from './GameModeComponent';

export function PlayCard() {
  const gameModeData = [
    {
      icon: (
        <img
          src={lightningIcon}
          className="inline-block mt-1 h-7 w-7"
          alt="online"
        />
      ),
      title: 'Play Online',
      description: 'Play vs a Person of Similar Skill',
      onClick: () => {
        navigate('/game/random');
      },
      disabled: false,
    },
    {
      icon: (
        <img
          src={computerIcon}
          className="inline-block mt-1 h-7 w-7"
          alt="computer"
        />
      ),
      title: 'Computer',
      description: 'Challenge a bot from easy to master',
      disabled: true,
    },
    {
      icon: (
        <img
          src={friendIcon}
          className="inline-block mt-1 h-7 w-7"
          alt="friend"
        />
      ),
      title: 'Play a Friend',
      description: 'Invite a Friend to a game of Chess',
      disabled: true,
    },
    {
      icon: (
        <img
          src={tournamentIcon}
          className="inline-block mt-1 h-7 w-7"
          alt="tournament"
        />
      ),
      title: 'Tournaments',
      description: 'Join an Arena where anyone can Win',
      disabled: true,
    },
    {
      icon: (
        <img
          src={variantsIcon}
          className="inline-block mt-1 h-7 w-7"
          alt="variants"
        />
      ),
      title: 'Chess Variants',
      description: 'Find Fun New ways to play chess',
      disabled: true,
    },
  ];

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
        {gameModeData.map((data) => {
          return <GameModeComponent {...data} />;
        })}
      </CardContent>
    </Card>
  );
}
