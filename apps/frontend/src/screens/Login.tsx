import { useNavigate } from 'react-router-dom';
import GoogleIcon from '../assets/google.png';
import GithubIcon from '../assets/github.png';

const BACKEND_URL =
  import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (provider: string) => {
    window.open(`${BACKEND_URL}/auth/${provider}`, '_self');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-md w-full p-8 rounded-lg shadow-lg bg-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Enter the Chess World
        </h1>
        <div className="flex flex-col items-center">
          <button
            className="flex items-center justify-center w-full py-3 mb-4 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={() => handleLogin('google')}
          >
            <img src={GoogleIcon} alt="Google" className="w-6 h-6 mr-2" />
            Sign in with Google
          </button>
          <button
            className="flex items-center justify-center w-full py-3 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={() => handleLogin('github')}
          >
            <img src={GithubIcon} alt="Github" className="w-6 h-6 mr-2" />
            Sign in with Github
          </button>
        </div>
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-500"></div>
          <span className="mx-4 text-gray-400">OR</span>
          <div className="flex-grow h-px bg-gray-500"></div>
        </div>
        <input
          type="text"
          placeholder="Username"
          className="w-full py-3 px-4 mb-4 rounded-md bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          className="w-full py-3 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          onClick={() => navigate('/game/random')}
        >
          Enter as Guest
        </button>
      </div>
    </div>
  );
};

export default Login;
