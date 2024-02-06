import Icon from "@mdi/react";
import { mdiArrowULeftTop, mdiClose, mdiCog } from "@mdi/js";
import { useRef, useState } from "react";
import { DarkModeSwitcher } from "../components/DarkModeSwitcher";
import { GameMoves } from "../Game";
import { useNavigate } from "react-router-dom";
import { PassAndPlayToggle } from "./PassAndPlayToggle";

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

    return (
        <>
            <button
                onClick={() => {
                    menuDialogRef.current?.showModal();
                }}
                className="btn btn-circle btn-ghost fixed right-3 top-3"
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
                    {view === "menu" && (
                        <div className="flex flex-col gap-5 pt-3">
                            <button
                                onClick={() => {
                                    setView("howToPlay");
                                }}
                                className="btn btn-primary text-xl"
                            >
                                How to Play
                            </button>
                            <DarkModeSwitcher />
                            <PassAndPlayToggle
                                setPassAndPlay={setPassAndPlay}
                                passAndPlay={passAndPlay}
                            />
                            <button
                                onClick={() => {
                                    configureGame();
                                    menuDialogRef.current?.close();
                                }}
                                className="btn btn-error text-xl"
                            >
                                Configure New Match
                            </button>
                            <button
                                onClick={() => {
                                    navigate(`/`);
                                    menuDialogRef.current?.close();
                                }}
                                className="btn btn-primary text-xl"
                            >
                                <span>Exit to Lobby</span>
                                <span className="text-sm">
                                    (game will be saved)
                                </span>
                            </button>
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
                            <span>
                                <h1 className="text-2xl font-medium">
                                    How to Play Dicey Darts
                                </h1>
                                <p>
                                    Lorem ipsum dolor sit amet consectetur
                                    adipisicing elit. Quae, voluptatum repellat!
                                    Quisquam, quidem. Quisquam voluptatibus,
                                    voluptatum, quibusdam voluptatem, quas
                                    dolorum quidem quae suscipit quos voluptates
                                    quod. Quisquam voluptatibus, voluptatum,
                                    quibusdam voluptatem, quas dolorum quidem
                                    quae suscipit quos voluptates quod.
                                </p>
                            </span>
                        </div>
                    )}
                </div>
            </dialog>
        </>
    );
};
