import GameModeComponent from './GameModeComponent';
import {
  EyeNoneIcon,
  PersonIcon,
  LightningBoltIcon,
} from '@radix-ui/react-icons';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function PlayCard() {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader className="pb-3 text-center">
        <CardTitle>Play Chess</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1">
        <GameModeComponent
          icon={<LightningBoltIcon />}
          title="Play Online"
          description="Play vs a Person of Similar Skill"
          onClick={() => {
            navigate('/game/random');
          }}
        />
        <GameModeComponent
          icon={<PersonIcon className="mt-px h-5 w-5" />}
          title="Computer"
          description="Challenge a bot from easy to master (coming soon)"
        />
        <GameModeComponent
          icon={<PersonIcon className="mt-px h-5 w-5" />}
          title="Play a Friend"
          description="Invite a Friend to a game of Chess (coming soon)"
        />
        <GameModeComponent
          icon={<EyeNoneIcon className="mt-px h-5 w-5" />}
          title="Tournaments"
          description="Join an Arena where anyone can Win (coming soon)"
        />
        <GameModeComponent
          icon={<EyeNoneIcon className="mt-px h-5 w-5" />}
          title="Chess Variants"
          description="Find Fun New ways to play chess (coming soon)"
        />
      </CardContent>{' '}
    </Card>
  );
}
