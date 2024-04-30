import {
  GitHubLogoIcon,
  VideoIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons';

export const Footer = () => {
  return (
    <footer className="mt-40 border-t border-gray-600 py-16 text-white">
      <div className="w-[96%] max-w-screen-lg mx-auto flex flex-row justify-between">
        <div className="flex items-center">
          <img
            className="w-4 h-4 mt-[-5px]"
            src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713654408/chess-svgrepo-com_m9g5p1.svg"
          />
          <h2 className="text-lg text-white">chess.100x</h2>
        </div>
        <div>
          <div className="flex gap-3 mt-4">
            <a href="https://github.com/hkirat" target="_blank">
              <GitHubLogoIcon />
            </a>
            <a href="https://www.youtube.com/@harkirat1" target="_blank">
              <VideoIcon />
            </a>
            <a href="https://twitter.com/kirat_tw" target="_blank">
              <TwitterLogoIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
