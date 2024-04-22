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
        <div
          onClick={() => {
            navigate('/game/random');
          }}
          className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <LightningBoltIcon className="mt-px h-5 w-5" />
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Play Online</p>
            <p className="text-sm text-muted-foreground">
              Play vs a Person of Simillar Skill
            </p>
          </div>
        </div>
        <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all ">
          <PersonIcon className="mt-px h-5 w-5" />
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Computer</p>
            <p className="text-sm text-muted-foreground">
              Challenge a bot from easy to master (coming soon)
            </p>
          </div>
        </div>
        <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all">
          <PersonIcon className="mt-px h-5 w-5" />
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Play a Friend</p>
            <p className="text-sm text-muted-foreground">
              Invite a Friend to a game of Chess (coming soon)
            </p>
          </div>
        </div>
        <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all ">
          <EyeNoneIcon className="mt-px h-5 w-5" />
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Tournaments</p>
            <p className="text-sm text-muted-foreground">
              Join an Arena where anyone can Win (coming soon)
            </p>
          </div>
        </div>

        <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all ">
          <EyeNoneIcon className="mt-px h-5 w-5" />
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Chess Variants</p>
            <p className="text-sm text-muted-foreground">
              Find Fun New ways to play chess (coming soon)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
