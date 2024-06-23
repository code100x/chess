import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogDescription,
} from './ui/alert-dialog';

const ExitGameModel = ({ onClick } : {onClick : () => void}) => {

  return (
    <AlertDialog>
      <AlertDialogTrigger className='w-24 h-12  bg-stone-800 rounded-md font-semibold text-white'>Exit</AlertDialogTrigger>
      <AlertDialogContent className='bg-stone-800 border-stone-800'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-white font-mono'>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className='text-white font-mono'>
            This action cannot be undone. This will be considered as a loss.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='font-mono bg-[#739552] text-white font-semibold hover:bg-[#b2e084] hover:text-gray-700 border-none'>Continue</AlertDialogCancel>
          <AlertDialogAction
            onClick={onClick}
            className='bg-[#e2e6aa] min-w-20 text-gray-900 hover:text-slate-100 hover:bg-[#bbc259] font-semibold'
          >
            Exit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExitGameModel;
