import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const GameButton = ({
    className,
    ...props
}: ComponentProps<"button">) => {
    return (
        <button
            className={twMerge(
                "btn md:btn-lg md:text-xl btn-primary uppercase whitespace-nowrap rounded-full",
                className,
            )}
            {...props}
        />
    );
};