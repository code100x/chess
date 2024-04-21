import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from './ui/alert-dialog';

type DrawDialogProps = {
  drawReqSent: boolean;
  myColor: string;
  setDrawReq: React.Dispatch<React.SetStateAction<boolean>>;
};

export function DrawDialog({
  myColor,
  drawReqSent,
  setDrawReq,
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
                // TODO: Implement this
                console.log('drw accepted');
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
