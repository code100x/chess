//TODO: Make prettier
import { VscLoading } from "react-icons/vsc";
export const Loader = () => {
  return (
    <div className="w-full flex justify-center items-center animate-spin h-96">
      <VscLoading className="w-8 h-8" />
    </div>
  )
};
