import { useState } from "react";
import compassLogo from "./assets/compass.svg";
import { twMerge } from "tailwind-merge";

const LogoImage = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"img">) => (
  <img
    className={twMerge(
      "h-24 m-6 transition will-change-contents filter duration-300 hover:drop-shadow-[0_0_32px_#646cffaa]",
      className
    )}
    {...props}
  />
);

export const App = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col place-items-center min-h-screen text-center p-8 justify-center">
      <div className="flex">
        <LogoImage
          src={compassLogo}
          alt="React logo"
          className="hover:drop-shadow-[0_0_32px_#61dafbaa] motion-safe:animate-[spin_15s_linear_infinite]"
        />
      </div>
      <h1>Adventure AI</h1>
      <div className="p-8">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p>Click on the Vite and React logos to learn more</p>
    </div>
  );
};
