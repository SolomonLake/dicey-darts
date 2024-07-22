import Icon from "@mdi/react";
import {
    mdiArrowULeftTop,
    mdiClose,
    mdiCog,
    mdiHelp,
    mdiRestart,
} from "@mdi/js";
import { useContext, useEffect, useRef, useState } from "react";
import { DarkModeSwitcher } from "../components/DarkModeSwitcher";
import { GameMoves } from "../Game";
import { useNavigate } from "react-router-dom";
import { PassAndPlayToggle } from "./PassAndPlayToggle";
import { HowToPlay } from "./HowToPlay";
import {
    DiceSpinSpeedContext,
    useDiceSpinSpeed,
} from "../contexts/DiceSpinSpeedContext";

export const SettingsMenu = ({
    configureGame,
    setPassAndPlay,
    passAndPlay,
}: {
    configureGame: GameMoves["configureGame"];
    setPassAndPlay: GameMoves["setPassAndPlay"];
    passAndPlay: boolean;
}) => {
    const navigate = useNavigate();
    const menuDialogRef = useRef<HTMLDialogElement>(null);
    const [view, setView] = useState<"menu" | "howToPlay">("menu");
    const { diceSpinSpeed, setDiceSpinSpeed } = useDiceSpinSpeed();

    useEffect(() => {
        const onClose = () => {
            setView("menu");
        };
        if (menuDialogRef.current) {
            menuDialogRef.current.addEventListener("close", onClose);
        }
        return () => {
            if (menuDialogRef.current) {
                menuDialogRef.current.removeEventListener("close", onClose);
            }
        };
    }, [menuDialogRef]);

    return (
        <>
            <button
                onClick={() => {
                    menuDialogRef.current?.showModal();
                }}
                className="btn btn-circle btn-ghost fixed right-5 top-5"
            >
                <Icon path={mdiCog} size={1.5} />
            </button>
            <dialog
                ref={menuDialogRef}
                id="settingsMenuDialog"
                className="modal"
            >
                <div className="modal-box p-5 w-full h-full md:h-auto max-h-full md:max-h-[95vh] rounded-none md:rounded-box">
                    <form method="dialog" className="flex justify-end">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-circle btn-ghost">
                            <Icon path={mdiClose} size={1.5} />
                        </button>
                    </form>
                    <div className="pt-3">
                        {view === "menu" && (
                            <div className="flex flex-col">
                                <button
                                    onClick={() => {
                                        setView("howToPlay");
                                    }}
                                    className="btn btn-primary text-xl btn-outline justify-start"
                                >
                                    <Icon path={mdiHelp} size={1} />
                                    How to Play
                                </button>
                                <div className="divider" />
                                <div className="flex flex-col gap-2">
                                    <PassAndPlayToggle
                                        setPassAndPlay={setPassAndPlay}
                                        passAndPlay={passAndPlay}
                                    />
                                    {/* <DarkModeSwitcher /> */}
                                    <div className="flex pt-4">
                                        <label
                                            htmlFor="diceSpin"
                                            className="text-lg font-semibold text-primary text-left"
                                        >
                                            Dice Spin Speed
                                        </label>
                                        <div className="w-full">
                                            <input
                                                type="range"
                                                min={0}
                                                max="2"
                                                value={diceSpinSpeed}
                                                id="diceSpin"
                                                className="range range-primary range-xs"
                                                step="1"
                                                onChange={(e) => {
                                                    const val = parseInt(
                                                        e.target.value,
                                                    ) as 0 | 1 | 2;
                                                    setDiceSpinSpeed(val);
                                                    localStorage.diceSpinSpeed =
                                                        val;
                                                }}
                                            />
                                            <div className="flex w-full justify-between px-2 text-lg">
                                                <span className="relative">
                                                    <span className="absolute -left-1">
                                                        None
                                                    </span>
                                                </span>
                                                <span className="relative">
                                                    <span className="absolute -left-3.5">
                                                        Slow
                                                    </span>
                                                </span>
                                                <span className="relative">
                                                    <span className="absolute -left-7">
                                                        Fast
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="divider" />
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => {
                                            configureGame();
                                            menuDialogRef.current?.close();
                                        }}
                                        className="btn text-xl btn-outline btn-warning justify-start"
                                    >
                                        <Icon path={mdiRestart} size={1} />
                                        <span>Restart Game</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate(`/`);
                                            menuDialogRef.current?.close();
                                        }}
                                        className="btn text-xl btn-outline btn-warning justify-start"
                                    >
                                        <Icon
                                            path={mdiArrowULeftTop}
                                            size={1}
                                        />
                                        <span>Exit to Lobby</span>
                                        <span className="text-sm">
                                            (game will be saved)
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                        {view === "howToPlay" && (
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => {
                                        setView("menu");
                                    }}
                                    className="btn text-lg btn-outline"
                                >
                                    <Icon path={mdiArrowULeftTop} size={1.5} />
                                    Back
                                </button>
                                <HowToPlay />
                            </div>
                        )}
                    </div>
                </div>
            </dialog>
        </>
    );
};
