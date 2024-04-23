//TODO: Make prettier
export const Loader = () => {
  return <div className="w-full min-h-[100vh] flex items-center justify-center">
    <div className="flex-col gap-2">
      <img src={"/public/loader.png"} className={"w-20 h-20"} />
      <p className="text-white text-xl text-bold">Loading...</p>
    </div>
  </div>;
};
