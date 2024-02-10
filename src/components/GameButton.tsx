import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const GameButton = ({
    className,
    ...props
}: ComponentProps<"button">) => {
    return (
        <button
            className={twMerge(
                "btn md:btn-lg text-lg md:text-2xl btn-primary uppercase whitespace-nowrap rounded-full font-medium  disabled:text-opacity-60",
                className,
            )}
            {...props}
        />
    );
};
