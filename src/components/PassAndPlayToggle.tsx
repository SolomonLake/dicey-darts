import { twMerge } from "tailwind-merge";
import { mdiCellphone } from "@mdi/js";
import Icon from "@mdi/react";

export const PassAndPlayToggle = (props: {
    setPassAndPlay: (value: boolean) => void;
    passAndPlay: boolean;
}) => {
    return (
        <label className="label p-0">
            <span
                className={twMerge(
                    "btn text-xl w-full btn-outline justify-start",
                    props.passAndPlay && "btn-primary",
                )}
            >
                <Icon path={mdiCellphone} size={1} />
                Single device mode
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    onChange={(e) => {
                        props.setPassAndPlay(e.target.checked);
                    }}
                    checked={props.passAndPlay}
                />
            </span>
        </label>
    );
};
