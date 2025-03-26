import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import image from "@/assets/imgs/halfbg.webp";
import logoname from "@/assets/imgs/logoname.webp";

const App = () => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true); // Start fade-out animation
      setTimeout(() => {
        navigate("/login"); // Navigate after animation ends
      }, 1000); // Match animation duration
    }, 2000); // Wait 3 seconds before transition

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 1, filter: "blur(0px)" }}
      animate={{
        opacity: fadeOut ? 0 : 1,
        filter: fadeOut ? "blur(10px)" : "blur(0px)",
      }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="w-full min-h-screen flex items-center justify-center bg-white relative"
    >
      <img
        src={image}
        className="absolute inset-0 z-0 bg-cover size-full overflow-y-hidden"
      />
      <div className=" bg-black/15 z-10 w-full min-h-screen flex flex-col justify-center items-center">
        <span className="absolute inset-7 font-serif text-[#D3D3D3] md:text-4xl text-base">
          FINANCEFLOW
        </span>
        <div className="text-black font-bold text-4xl h-60 flex items-center justify-center overflow-y-hidden">
          <img
            src={logoname}
            alt="FinanceFlow Logo"
            className="object-cover "
          />
        </div>
      </div>
    </motion.div>
  );
};

export default App;
