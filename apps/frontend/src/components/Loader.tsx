import Spinner from '../../public/chessLoader.gif';

const Loader = () => {
  return (
    <div className="fixed chess-board top-0 left-0 w-full h-screen flex justify-center items-center z-10">
      <div className="p-4 rounded-md">
        <div className="flex justify-center">
          <>
            <img src={Spinner} alt="Loading ..." width={90} height={90} />
          </>
        </div>
      </div>
    </div>
  );
};

export default Loader;
