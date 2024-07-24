import React, {
    createContext,
    Dispatch,
    SetStateAction,
    useEffect,
} from "react";
import {
    getInitialReducedMotion,
    usePrefersReducedMotion,
} from "../hooks/usePrefersReducedMotion";

export type DiceSpinSpeedOption = 0 | 1 | 2;

export const INITIAL_SPIN_SPEED =
    typeof parseInt(localStorage.diceSpinSpeed) === "number"
        ? (parseInt(localStorage.diceSpinSpeed) as DiceSpinSpeedOption)
        : getInitialReducedMotion()
          ? 0
          : 1;

const DiceSpinSpeedContext = createContext<{
    diceSpinSpeed: DiceSpinSpeedOption;
    setDiceSpinSpeed: Dispatch<SetStateAction<DiceSpinSpeedOption>>;
}>({
    diceSpinSpeed: INITIAL_SPIN_SPEED,
    setDiceSpinSpeed: () => {},
});
export const DiceSpinSpeedProvider = DiceSpinSpeedContext.Provider;

export const useDiceSpinSpeed = () => {
    const context = React.useContext(DiceSpinSpeedContext);
    if (context === undefined) {
        throw new Error(
            "useDiceSpinSpeed must be used within a DiceSpinSpeedProvider",
        );
    }
    const { diceSpinSpeed, setDiceSpinSpeed } = context;

    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        if (!localStorage.getItem("diceSpinSpeed") && prefersReducedMotion) {
            setDiceSpinSpeed(0);
        }
    }, [prefersReducedMotion]);

    useEffect(() => {
        const handleChange = () => {
            setDiceSpinSpeed(
                parseInt(localStorage.diceSpinSpeed) as DiceSpinSpeedOption,
            );
        };

        window.addEventListener("storage", handleChange);
        return () => window.removeEventListener("change", handleChange);
    }, []);

    return context;
};
