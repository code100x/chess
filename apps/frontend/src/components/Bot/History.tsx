import React, { useRef } from 'react';
import MovesTable from '../MovesTable';
import * as engine from './engine';



const History: React.FC<{ history: Array<engine.Move> }> = ({ history }) => {
    const moves= history.map(({ from, to }: engine.Move) => {
      return { from, to};
    });
  
    const endRef = useRef<HTMLDivElement>(null);
  
    return (
      <div className=" bg-brown-500  ml-[56vw] mr-[18vw] h-[78vh] overflow-scroll mt-">
        <MovesTable moves={moves}/>
        <div ref={endRef} />
      </div>
    );
  };

  export default History;