import { useUser } from "@repo/store/useUser"
import { Metadata, Player } from "../screens/Game"
import { PlayerTitle } from "./PlayerTitle"

interface Heading {
    gameMetadata: Metadata | null
}

export const MatchHeading = ({gameMetadata}: Heading) => {
    const user = useUser()
    let selfPlayer: Player | undefined = {id: user.id, name: user.name}
    let opponent: Player | undefined
    if (gameMetadata?.blackPlayer && gameMetadata?.whitePlayer) {
        if (user.id === gameMetadata?.blackPlayer.id) {
            selfPlayer = gameMetadata?.blackPlayer
            opponent = gameMetadata?.whitePlayer
        } else {
            selfPlayer = gameMetadata?.whitePlayer
            opponent = gameMetadata?.blackPlayer
        }
    }
    return (
        <div className="justify-center flex pt-4 text-white gap-2">
            <PlayerTitle player={selfPlayer} isSelf />
            {opponent &&
                <>
                    <p>vs</p>
                    <PlayerTitle player={opponent} />
                </>
            }
        </div>
    )
}