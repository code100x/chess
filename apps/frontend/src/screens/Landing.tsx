import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/Button";
import BackgroundSvg from "../components/BackgroundSvg";

export const Landing = () => {
  const navigate = useNavigate();

  // Variants for animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } },
  };

  return (
    <motion.div
      className="flex justify-center overflow-hidden relative h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <BackgroundSvg />
      <div className="py-8 max-w-screen-xl z-[1]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 h-full">
          <div className="col-span-2 flex justify-center items-center">
            <motion.img
              src={"/chessboard.jpeg"}
              className="max-w-screen-sm animate-glow"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="pt-16 flex flex-col items-center justify-center"> {/* Adjusted alignment */}
            <div className="flex justify-center">
              <h1 className="text-4xl font-bold text-white text-center"> {/* Centered text */}
                Play chess online on the #2 Site!
              </h1>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center"> {/* Adjusted alignment */}
              <motion.div
                className="bg-gradient-to-br from-yellow-500 to-orange-500 p-0.5 rounded-[6px] duration-500 shadow-[-30_0_1rem_-1rem,0_0_1rem_-1rem] hover:shadow-[-1rem_0_2rem_-0.5rem,1rem_0_2rem_-0.5rem] hover:shadow-orange-400"
                whileHover={{ scale: 1.1 }}
              >
                <Button
                  className="bg-slate-950 rounded-[5px] px-4 duration-300 transition-colors hover:bg-black/80 font-medium"
                  onClick={() => navigate("/game/random")}
                >
                  Play Online
                </Button>
              </motion.div>
              <motion.div
                className="mt-4 rounded-[6px] h-auto hover:bg-green-600 duration-300 font-medium" 
                whileHover={{ scale: 1.1 }}
              >
                <Button
                  className="rounded-[6px] h-auto hover:bg-green-600 duration-300 font-medium"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
