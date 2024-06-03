import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Landing } from './screens/Landing';
import { Game } from './screens/Game';
import Login from './screens/Login';
import { Suspense } from 'react';
import { RecoilRoot } from 'recoil';
import { Loader } from './components/Loader';
import { Spectate } from './screens/Spectate';
import { Review } from './screens/Review';
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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout children={<Landing />} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/game/:gameId" element={<Layout children={<Game />} />} />
        <Route
          path="/spectate/:gameId"
          element={<Layout children={<Spectate />} />}
        />
        <Route
          path="/review/:gameId"
          element={<Layout children={<Review />} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
