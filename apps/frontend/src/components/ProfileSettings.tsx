import { useEffect, useState } from 'react';
import { StarIcon } from '@radix-ui/react-icons';
import { UserIcon } from 'lucide-react';
import { TrashIcon } from '@radix-ui/react-icons';
import axios from 'axios';

const BACKEND_URL =
  import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';

//@ts-ignore
const ProfileSettings = ({ userInfo }) => {
  const [username, setUsername] = useState(userInfo?.username || '');
  const [changesSaved, setChangesSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setter(e.target.value);
    setChangesSaved(false);
  };

  const deleteAccount = () => {
    setShowModal(true);
  };

  useEffect(() => {
    if (confirmation) {
      axios
        .delete(`${BACKEND_URL}/auth/deleteAccount`, { withCredentials: true })
        .then((response) => {
          if (response.data.success) {
            window.location.href = `${BACKEND_URL}/auth/logout`;
          }
        })
        .catch((error) => {
          console.error('Error deleting account:', error);
        })
        .finally(() => {
          setShowModal(false);
        });
    }
  }, [confirmation]);

  const handleSaveChanges = () => {
    const data = { username: username };
    axios
      .post(`${BACKEND_URL}/auth/updateUser`, data, { withCredentials: true })
      .then((response) => {
        if (response.data.success) {
          alert('Changes saved successfully!');
          setChangesSaved(true);
        } else {
          alert('Failed to save changes. Please try again later.');
        }
      })
      .catch((error) => {
        console.error('Error saving changes:', error);
      });
  };

  return (
    <div className="text-white p-6 rounded-md shadow-md bg-stone-800">
      <div className="flex items-center mb-6">
        <UserIcon className="w-8 h-8 mr-2 text-gray-400" />
        <h2 className="text-2xl font-semibold">Profile Settings</h2>
      </div>
      <div className="mt-10">
        <p className="mb-4 flex items-center justify-between">
          <span className="font-semibold mr-2">Rating </span>
          <div className="flex items-center">
            <StarIcon width={20} height={20} color="gold" />
            <span className="text-lg font-semibold ml-1">
              {userInfo?.rating}
            </span>
          </div>
        </p>
        <p className="mb-4 flex items-center justify-between">
          <span className="font-semibold mr-1">Email </span>
          <span className="text-md font-medium ml-1 tracking-wide">
            {userInfo?.email}
          </span>
        </p>
        <p className="mb-4 flex items-center justify-between">
          <span className="font-semibold mr-1">Name </span>
          <span className="text-md font-medium ml-1 tracking-wide">
            {userInfo?.name}
          </span>
        </p>
        <p className="mb-4 flex items-center justify-between">
          <span className="font-semibold mr-1">Username </span>
          <input
            className="text-white p-1 pl-2 rounded-md outline-none bg-stone-900"
            type="text"
            value={username}
            onChange={(e) => handleInputChange(e, setUsername)}
          />
        </p>

        <div className="w-1/2 flex flex-col md:flex-row justify-around items-center mt-10 m-auto">
          <button
            className={`bg-green-700 mb-2 md:mb-0 p-2 rounded-md hover:bg-green-500 ${
              changesSaved ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleSaveChanges}
            disabled={changesSaved}
          >
            {changesSaved ? 'Changes Saved' : 'Save Changes'}
          </button>
          <button
            onClick={deleteAccount}
            className="bg-red-600 p-2 rounded-md cursor-pointer hover:bg-red-500"
          >
            Delete account
          </button>
        </div>
        {showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-stone-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                      <TrashIcon width={20} height={20} color="red" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3
                        className="text-lg leading-6 font-medium text-white"
                        id="modal-title"
                      >
                        Delete Account
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-300">
                          Are you sure you want to delete your account?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-stone-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={() => {
                      setConfirmation(true);
                    }}
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
