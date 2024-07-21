import { mdiCrown } from "@mdi/js";
import Icon from "@mdi/react";
import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const WinnerCrown = ({
    className,
    ...props
}: Partial<ComponentProps<typeof Icon>>) => {
    return (
        <Icon
            path={mdiCrown}
            className={twMerge(
                "text-primary bg-base-100 rounded-full p-[2px]",
                className,
            )}
            size={0.8}
            {...props}
        />
    );
};
