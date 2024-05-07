import { PlayCard } from '@/components/Card';

export const Landing = () => {
  return (
    <div className="max-w-full h-screen chess-board mt-0">
      <div className="flex flex-col md:flex-row w-full md:w-3/4 max-w-screen-lg mx-auto gap-x-4 p-4">
        <img
          className="rounded-md w-full md:h-3/4  hidden md:block"
          src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713647295/standardboard.1d6f9426_asqzum.png"
          alt="chess-board"
        />
        <PlayCard />
      </div>
    </div>
  );
};
