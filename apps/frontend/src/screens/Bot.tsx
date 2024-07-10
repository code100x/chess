import BotGame from "../components/Bot/BotGame";
import  bots  from "../helper/Bots";

const Bot  = ()=>{
    return (
        <div className='overflow-hidden no-scrollbar'>
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