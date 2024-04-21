import BotGame from "../components/Bot/BotGame";
import  bots  from "../components/Bot/Bots";

const Bot  = ()=>{
    return (
        <div>
             <BotGame
                bots={bots}
                onGameCompleted={winner => {
                    window.alert(
                    `${winner === 'b' ? 'Black' : winner === 'w' ? 'White' : 'No one'} is the winner!`
                    );
                }}
            />
        </div>
    )
}

export default Bot;