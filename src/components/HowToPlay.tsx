// import

import { mdiBullseyeArrow } from "@mdi/js";
import Icon from "@mdi/react";
import { WinnerCrown } from "./WinnerCrown";

export const HowToPlay = () => {
    return (
        <div className="">
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
                    roll a number you've advanced this turn, you will BUST!
                    losing all of the progress you've made during the turn.
                    Eventually you'll want to be safe, and STOP.
                </p>
                <p className="text-accent">
                    Try your hand at Dicey Darts, and push your luck to win!
                </p>
            </div>
        </div>
    );
};
