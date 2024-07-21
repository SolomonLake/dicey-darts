// import

import { mdiBullseyeArrow } from "@mdi/js";
import Icon from "@mdi/react";
import { WinnerCrown } from "./WinnerCrown";
import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const HowToPlay = ({ className, ...props }: ComponentProps<"div">) => {
    return (
        <div className={twMerge("", className)} {...props}>
            <h1 className="text-2xl font-medium">How to Play Dicey Darts</h1>
            <div className="text-lg">
                <p>
                    Objective: You win
                    <WinnerCrown className="inline" size={1} /> if you have the
                    <span className="text-primary"> lowest points</span> and 5
                    completed sets of numbers.
                </p>
                <p>
                    Your turn: ROLL the dice, and hit numbers to advance. After{" "}
                    <span className="text-primary">
                        hitting a number 3 times you've completed a{" "}
                        <span className="whitespace-nowrap">
                            set
                            <Icon
                                path={mdiBullseyeArrow}
                                className="inline"
                                size={1}
                            />
                            !{" "}
                        </span>
                    </span>
                    Keep hitting numbers in that set to give other players
                    points!
                </p>
                <p>
                    <span className="text-warning">Warning!</span> If you don't
                    roll a{" "}
                    <span className="rounded-md p-1 bg-primary text-primary-content">
                        number
                    </span>{" "}
                    you've advanced this turn, you will BUST! losing all of the
                    progress you've made during the turn. Eventually you'll want
                    to be safe, and STOP.
                </p>
                <p className="text-accent">
                    Push your luck and win at Dicey Darts!
                </p>
            </div>
        </div>
    );
};
