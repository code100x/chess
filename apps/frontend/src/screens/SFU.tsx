import { useSFUClient } from "../hooks/useSFUClient";

const SFU = () => {
  const {localVideoRef, remoteVideoRef} = useSFUClient();
  return (
    <div className="flex p-20 gap-20 relative">
      <video
        id="1"
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="w-40 h-30 absolute rounded-md border-2 border-[#333] bottom-24 left-24 scale-x-[-1] z-20"
      />
      <video
        id="2"
        ref={remoteVideoRef}
        autoPlay
        playsInline
        muted
        className="w-1/2 h-full rounded-md border-2 border-[#333] scale-x-[-1]"
      />
    </div>
  );
};

export default SFU;
