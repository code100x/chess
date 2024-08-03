import { Player } from "../screens/Game"

interface PlayerTitleProps {
    player: Player | undefined
    isSelf?: boolean
}

export const PlayerTitle = ({player, isSelf}: PlayerTitleProps) => {
    return (
        <div className="flex gap-1">
            {player && player.id.startsWith("guest") &&
                <p className="text-gray-500">
                    [Guest]
                </p>
            }
            <p>{player && player.name}</p>
            {isSelf &&
                <p className="text-gray-500">(You)</p>
            }
        </div>
    )
}