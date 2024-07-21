export const PassAndPlayToggle = (props: {
    setPassAndPlay: (value: boolean) => void;
    passAndPlay: boolean;
}) => {
    return (
        <label className="label">
            <span className="btn text-xl w-full">
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
