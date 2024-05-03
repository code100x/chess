import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Landing } from './screens/Landing';
import Bot from './screens/Bot';
import { Game } from './screens/Game';
import Login from './screens/Login';
import { Suspense } from 'react';
import { RecoilRoot } from 'recoil';
import { useUser } from '@repo/store/useUser';
import { Loader } from './components/Loader';
import { Layout } from './layout';

function App() {
  return (
    <div className="min-h-screen bg-stone-800">
      <RecoilRoot>
        <Suspense fallback={<Loader />}>
          <AuthApp />
        </Suspense>
      </RecoilRoot>
    </div>
  );
}

function AuthApp() {
  const user = useUser();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout children={<Landing />} />} />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route 
          path="/bot" 
          element={<Layout children={<Bot />} />}
        />
        <Route
          path="/game/:gameId"
          element={<Layout children={<Game />} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
