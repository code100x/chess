import { DRAW_OFFER_ACCEPTED } from '../screens/Game';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from './ui/alert-dialog';

type DrawDialogProps = {
  drawReqSent: boolean;
  myColor: string;
  setDrawReq: React.Dispatch<React.SetStateAction<boolean>>;
  socket: WebSocket;
  gameId: string;
};

export function DrawDialog({
  myColor,
  drawReqSent,
  setDrawReq,
  socket,
  gameId,
}: DrawDialogProps) {
  if (!drawReqSent) return null;

  return (
    <>
      <AlertDialog open={drawReqSent}>
        <AlertDialogContent className="bg-black text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {myColor === 'black' ? 'white' : 'black'} is offering a draw? Do
              you wish to accept it?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDrawReq(false);
              }}
            >
              No!!!
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                socket.send(
                  JSON.stringify({
                    type: DRAW_OFFER_ACCEPTED,
                    payload: {
                      gameId,
                    },
                  }),
                );
                setDrawReq(false);
              }}
            >
              Yes!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
