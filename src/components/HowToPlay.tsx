// import

import { mdiBullseyeArrow, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { WinnerCrown } from "./WinnerCrown";
import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const HowToPlay = ({ className, ...props }: ComponentProps<"div">) => {
    return (
        <div className={twMerge("", className)} {...props}>
            <h1 className="text-2xl font-medium">How to Play Dicey Darts</h1>
            <div className="text-lg text-left">
                <p>
                    Objective: You win
                    <WinnerCrown className="inline" size={1} /> if you have the
                    <span className="text-primary"> lowest points</span> and 5/5
                    <Icon
                        path={mdiBullseyeArrow}
                        className="inline"
                        size={1}
                    />{" "}
                    bullseyes.
                </p>
                <p>
                    Your turn: ROLL the dice, and choose numbers to advance.
                    After{" "}
                    <span className="text-primary">
                        choosing a number 3 times you've completed a{" "}
                        <span className="whitespace-nowrap">
                            bullseye
                            <Icon
                                path={mdiBullseyeArrow}
                                className="inline"
                                size={1}
                            />
                            !{" "}
                        </span>
                    </span>
                    Keep choosing bullseye numbers to give other players{" "}
                    <span className="bg-primary text-primary-content px-1.5 rounded-full whitespace-nowrap">
                        + points
                    </span>{" "}
                    !
                </p>
                <p>
                    <span className="text-warning">Warning!</span> If you don't
                    roll a{" "}
                    <span className="rounded-sm p-1 bg-primary text-primary-content">
                        number
                    </span>{" "}
                    you've advanced this turn, you will BUST! losing all of the
                    progress you've made. Eventually you'll want to be safe, and
                    STOP.
                </p>
                <p className="text-accent">
                    Push your luck and win at Dicey Darts!
                </p>
            </div>
        </div>
    );
};
