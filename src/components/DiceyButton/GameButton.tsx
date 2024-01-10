import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const GameButton = ({
    className,
    ...props
}: ComponentProps<"button">) => {
    return (
        <button
            className={twMerge(
                "btn md:btn-lg btn-primary uppercase whitespace-nowrap",
                className,
            )}
            {...props}
        />
    );
};
