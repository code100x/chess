import React, { useEffect } from 'react';
import BotDetail from '../../helper/BotDetail';
import type { AvailableBots, InitialisedBot } from '../../helper/Bots';

export type SelectedBot = {
  name: string;
  move: InitialisedBot;
  avatar: string;
  description: string;
  squareColor:{
    light:string,
    dark:string
  }

} | null;

const BotSelector: React.FC<{
  availableBots: AvailableBots;
  selectedBot: SelectedBot;
  setSelectedBot: (bot: SelectedBot) => void;
}> = ({ availableBots, selectedBot, setSelectedBot }) => {

  useEffect(() => {
    if (!selectedBot) {
      setSelectedBot({ 
          name: 'Random',
          move: availableBots['Random'](),
          avatar: BotDetail('Random').avatar,
          description: BotDetail('Random').description,
          squareColor:{
            light: '#EBEDD0',
            dark: '#739552'
          }
         });
    }
  },[]);


  const handleChange = (name: string) => {
    setSelectedBot(
      name
        ? { 
            name, 
            move: availableBots[name](),
            avatar: BotDetail(name).avatar,
            description: BotDetail(name).description,
            squareColor:{
                light: BotDetail(name).squareColor.light,
                dark: BotDetail(name).squareColor.dark
            }
           }
        : null,
    );
  };
  
  return (
    <div className="m-[10px] flex flex-wrap justify-center  mt-0 mb-[0.9rem] max-w-[22rem]">
          {Object.keys(availableBots).map((name) => (
            <div className='cursor-pointer h-[25%] p-0 px-[0.6rem] pb-[1.2rem] w-[25%] items-start flex relative '>
              <button onClick={() => handleChange(name)}>
                <img className=" rounded h-auto max-w-[100%]" src={BotDetail(name).avatar} alt={name} />
              </button>
            </div>
          ))}
    </div>
  );
};

export default BotSelector;
