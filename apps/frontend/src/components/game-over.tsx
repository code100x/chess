import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from './ui/alert-dialog';
type GameOverProps = {
  isGameOver: boolean;
  setResult: React.Dispatch<
    React.SetStateAction<
      | 'WHITE_WINS'
      | 'BLACK_WINS'
      | 'DRAW'
      | 'RESIGN_B'
      | 'RESIGN_W'
      | 'opponent_disconnected'
      | 'user_timeout'
      | null
    >
  >;
  result: string;
};

export function GameOver({ setResult, isGameOver, result }: GameOverProps) {
  return (
    <>
      <AlertDialog open={isGameOver}>
        <AlertDialogContent className="bg-green-600 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex flex-col items-center">
              <p className="text-2xl font-semibold">
                {result === 'WHITE_WINS' && 'White wins'}
                {result === 'BLACK_WINS' && 'Black wins'}
                {result === 'DRAW' && 'Draw'}
                {result === 'RESIGN_B' && 'Black Resigned! White Wins!!!'}
                {result === 'RESIGN_W' && 'White Resigned! Black Wins!!!'}
              </p>
              <img src="/wk.png" className="h-64 w-64" alt="" />
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center items-center">
            <AlertDialogCancel
              onClick={() => {
                setResult(null);
              }}
            >
              View Board
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {}}>
              <a href="/game/random">Find next!</a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
