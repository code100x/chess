import { useUser, useUserInfo } from '@repo/store/useUser';
import { useEffect, useState } from 'react';
import ProfileSettings from '../components/ProfileSettings';
import GameSettings from '../components/GameSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const user = useUser();
  const userInfo = useUserInfo();

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto p-6 rounded-md">
        <div className="flex justify-center space-x-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`focus:outline-none w-full shadow-md  focus:border-transparent py-2 px-4 rounded-sm ${
              activeTab === 'profile'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 bg-gray-200'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`focus:outline-none w-full shadow-md  focus:border-transparent py-2 px-4 rounded-sm ${
              activeTab === 'games'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 bg-gray-200'
            }`}
          >
            Games
          </button>
        </div>
        <div className="mt-6">
          {activeTab === 'profile' && <ProfileSettings userInfo={userInfo} />}
          {activeTab === 'games' && <GameSettings userInfo={userInfo} />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
