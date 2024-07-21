import { twMerge } from "tailwind-merge";

export const PassAndPlayToggle = (props: {
    setPassAndPlay: (value: boolean) => void;
    passAndPlay: boolean;
}) => {
    return (
        <label className="label p-0">
            <span
                className={twMerge(
                    "btn text-xl w-full btn-outline",
                    props.passAndPlay && "btn-primary",
                )}
            >
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
