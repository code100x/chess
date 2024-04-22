import { DemoNotifications } from '@/components/Card';

export const Landing = () => {
  return (
    <div className="w-full h-full chess-board mx-auto">
      <div className="flex flex-col md:flex-row w-full md:w-3/4 max-w-screen-lg mx-auto gap-x-4 p-8 md:p-20">
        <img
          className="rounded-xl w-full h-auto md:max-h-full hidden md:block"
          src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713647295/standardboard.1d6f9426_asqzum.png"
          alt="chess-board"
        />
        <DemoNotifications />
      </div>
    </div>
  );
};
