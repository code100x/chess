import Google from "../assets/google.png";
import Github from "../assets/github.png";


import { useNavigate } from 'react-router-dom';

import BackgroundSvg from "../components/BackgroundSvg";

const BACKEND_URL = "http://localhost:3000";

const Login = () => {
  const navigate = useNavigate();

  const google = () => {
    window.open(`${BACKEND_URL}/auth/google`, "_self");
  };

  const github = () => {
    window.open(`${BACKEND_URL}/auth/github`, "_self");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen overflow-hidden bg-cover bg-center bg-black text-white relative h-full">
     <BackgroundSvg />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-lg p-8 rounded-lg shadow-lg bg-gray-800 bg-opacity-75">
          <h1 className="text-4xl font-bold mb-8 text-center text-green-500 drop-shadow-lg">
            Enter the Game World
          </h1>
          <div className="flex flex-col space-y-6">
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-300"
              onClick={google}
            >
              <img src={Google} alt="" className="w-6 h-6" />
              <span>Sign in with Google</span>
            </button>
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-300"
              onClick={github}
            >
              <img src={Github} alt="" className="w-6 h-6" />
              <span>Sign in with Github</span>
            </button>
            <div className="flex items-center justify-center space-x-4">
              <div className="bg-gray-600 h-px flex-grow"></div>
              <span className="text-gray-400">OR</span>
              <div className="bg-gray-600 h-px flex-grow"></div>
            </div>
            <input
              type="text"
              placeholder="Username"
              className="bg-gray-700 text-white px-6 py-3 rounded-lg w-full"
            />
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors duration-300"
              onClick={() => navigate('/game/random')}
            >
              Enter as guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
