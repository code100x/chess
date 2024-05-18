import { PlayCard } from '@/components/Card';
import { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Landing = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('login') === 'failed') {
      toast.error('Login failed , Please try again later');
    }
    if (params.get('login') === 'success') {
      toast.success('Login successful');
    }
    if (params.get('status') === 'logout') {
      toast.warning('Signout successful');
    }

    params.delete('login');
    const newUrl = window.location.pathname + params.toString();
    window.history.replaceState({}, '', newUrl);
  }, []);

  return (
    <div className="max-w-full h-screen chess-board mt-0">
      <ToastContainer autoClose={3000} />
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
