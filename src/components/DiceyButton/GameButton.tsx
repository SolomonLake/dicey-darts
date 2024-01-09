import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const GameButton = ({
    className,
    ...props
}: ComponentProps<"button">) => {
    return (
        <button
            className={twMerge("btn btn-primary uppercase", className)}
            {...props}
        />
    );
};
