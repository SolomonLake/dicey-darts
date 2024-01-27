import Icon from "@mdi/react";
import { mdiClose, mdiCog } from "@mdi/js";
import { useRef } from "react";
import { DarkModeSwitcher } from "../components/DarkModeSwitcher";

export const SettingsMenu = () => {
    const menuDialogRef = useRef<HTMLDialogElement>(null);
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
                <div className="modal-box flex flex-col p-5 w-full h-full md:h-auto max-h-full md:max-h-[95vh] rounded-none md:rounded-box">
                    <form method="dialog" className="flex justify-end">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-circle btn-ghost">
                            <Icon path={mdiClose} size={1.5} />
                        </button>
                    </form>
                    <DarkModeSwitcher />
                </div>
            </dialog>
        </>
    );
};
