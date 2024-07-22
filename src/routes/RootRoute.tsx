import { Outlet } from "react-router-dom";
import { DarkModeSwitcher } from "../components/DarkModeSwitcher";
import {
    INITIAL_THEME,
    ThemeContext,
    ThemeOptions,
} from "../contexts/ThemeContext";
import { useState } from "react";
import {
    DiceSpinSpeedProvider,
    DiceSpinSpeedOption,
    INITIAL_SPIN_SPEED,
} from "../contexts/DiceSpinSpeedContext";

export const RootRoute = () => {
    const [theme, setTheme] = useState<ThemeOptions>(INITIAL_THEME);
    const [diceSpinSpeed, setDiceSpinSpeed] =
        useState<DiceSpinSpeedOption>(INITIAL_SPIN_SPEED);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <DiceSpinSpeedProvider
                value={{
                    diceSpinSpeed,
                    setDiceSpinSpeed,
                }}
            >
                <div className="flex flex-col w-full place-items-center h-dvh text-center p-5 gap-2 overflow-auto prose prose-stone max-w-none">
                    {/* Header */}
                    <div className="flex flex-row items-center gap-2 justify-between w-full">
                        <div className="flex-1">
                            <DarkModeSwitcher size="icon" />
                        </div>
                        <h1 className="mb-0 text-3xl flex-2 font-medium">
                            Dicey Darts
                        </h1>
                        <div className="flex-1"></div>
                    </div>
                    <Outlet />
                </div>
            </DiceSpinSpeedProvider>
        </ThemeContext.Provider>
    );
};
