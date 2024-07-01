import { useUser } from '@repo/store/useUser';
import { Metadata, Player } from '../screens/Game';

interface UserAvatarProps {
  gameMetadata: Metadata | null;
  self?: boolean;
}

export const UserAvatar = ({ gameMetadata, self }: UserAvatarProps) => {
  const user = useUser();
  let player: Player;
  if (gameMetadata?.blackPlayer.id === user.id) {
    player = self ? gameMetadata.blackPlayer : gameMetadata.whitePlayer;
  } else {
    player = self ? gameMetadata?.whitePlayer! : gameMetadata?.blackPlayer!;
  }

  return (
    <div className="text-white flex gap-2 ">
      <p>{player?.name}</p>
      {player?.isGuest && <p className="text-gray-500">[Guest]</p>}
    </div>
  );
};
