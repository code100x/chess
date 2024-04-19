import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Landing } from './screens/Landing';
import { Game } from './screens/Game';
import Login from './screens/Login';
import { useEffect, useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('http://localhost:3000/auth/auth/refresh', {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
          localStorage.setItem("token", (await response.json()).token);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchToken();
  }, []);

  return (
    <div className="h-screen bg-slate-950">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={isAuthenticated ? <Game /> : <Login />} />
          <Route path="/game" element={isAuthenticated ? <Game /> : <Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;