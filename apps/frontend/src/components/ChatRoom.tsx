import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

export const RECEIVE_MSG = 'receive_msg';
export const NEW_MSG = 'new_msg';

export const ChatRoom = ({
  gameId,
  socket,
  myMessage,
  setNewMessage,
}: {
  gameId: string;
  socket: WebSocket;
  myMessage: string;
  setNewMessage: Dispatch<SetStateAction<boolean>>;
}) => {
  const [send, setSend] = useState<string>('');
  const [displayText, setDisplayText] = useState<
    { msg: string; type?: string }[] | null
  >(null);

  const dataRef = useRef<any>(null);

  const scrollToBottom = () => {
    if (dataRef.current) {
      dataRef.current.scrollTop = dataRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayText]);

  useEffect(() => {
    if (myMessage) {
      setNewMessage(true);
      setDisplayText((prevMsg) => {
        if (prevMsg === null) {
          return [{ msg: myMessage, type: RECEIVE_MSG }];
        } else {
          return [...prevMsg, { msg: myMessage, type: RECEIVE_MSG }];
        }
      });
    }
  }, [myMessage]);

  if (!socket) return <div>Connecting...</div>;
  return (
    <>
      <div
        ref={dataRef}
        className="overflow-x-hidden  h-full w-full absolute flex flex-col border border-slate-500 rounded-lg"
      >
        <div className=" hover:shadow-2xl bg-zinc-700 rounded-b-lg text-center flex items-center top-0 sticky w-full">
          <div className=" p-4 font-bold text-4xl text-white grow">Message</div>
        </div>
        <div className="grow mb-16s">
          {displayText &&
            displayText.map((myMsg, i) => (
              <div
                className={`bg-slate-700 text-white font-semibold  m-2 rounded-lg p-2 text-pretty break-words ${
                  myMsg.type == RECEIVE_MSG
                    ? 'text-left mr-14'
                    : 'text-right ml-14'
                }`}
                key={i}
              >
                {myMsg.msg}
              </div>
            ))}
        </div>
        <div
          className={`flex pt-2 w-full bg-zinc-700 sticky bottom-0 rights md:px-4 py-2 rounded ${
            true ? 'block' : 'hidden'
          }`}
        >
          <div className="grow">
            <input
              className=" border-black border-2 rounded-2xl p-2 ml-2 w-full font-bold text-white bg-neutral-800"
              type="text"
              value={send}
              onChange={(e) => setSend(e.target.value)}
            />
          </div>
          <button
            className=" bg-gray-400 text-white font-bold hover:bg-gray-500 rounded-lg py-2 px-3 mx-3 md:mx-8"
            onClick={() => {
              send &&
                socket.send(
                  JSON.stringify({
                    type: NEW_MSG,
                    payload: { gameId, msg: send },
                  }),
                );
              send &&
                setDisplayText((prevMsg) => {
                  if (prevMsg === null) {
                    return [{ msg: send }];
                  } else {
                    return [...prevMsg, { msg: send }];
                  }
                });
              setSend('');
            }}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};
