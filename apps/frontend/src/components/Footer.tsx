import {
  GitHubLogoIcon,
  VideoIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-40 py-16 text-gray-400">
      <div className="w-[96%] max-w-screen-lg mx-auto flex flex-col items-center justify-center">
        <div>
          <Link to={"/"}>Home</Link> |
          <Link to={"/settings"}> Settings</Link> |
          <Link to={"/login"}> Login</Link> |
          <Link to={"/game/random"}> Play</Link>
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
