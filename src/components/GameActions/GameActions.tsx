import { Ctx } from "boardgame.io";
import { GameButton } from "../DiceyButton/GameButton";
import { GameMoves, MyGameState } from "../../Game";
import { DiceSumOptions, isSumOptionSplit } from "../../diceSumOptions";
import { twMerge } from "tailwind-merge";
import { ComponentProps } from "react";
import _ from "lodash";
import {NUM_DICE_CHOICE} from "../../constants";

const RollingActions = ({
    onRollDice,
    onStop,
    showStop,
    className,
    ...props
}: ComponentProps<"div"> & {
    onRollDice: GameMoves["rollDice"];
    onStop: GameMoves["stop"];
    showStop?: boolean;
}) => {
    return (
        <div className={twMerge("flex-col flex", className)} {...props}>
            <GameButton
                className="w-full"
                onClick={() => {
                    onRollDice();
                }}
            >
                Roll Dice
            </GameButton>
            {showStop && (
                <GameButton
                    onClick={() => {
                        onStop();
                    }}
                >
                    Stop
                </GameButton>
            )}
        </div>
    );
};

const SelectingActions = ({
    diceSumOptions,
    onSelectDice,
    className,
    ...props
}: ComponentProps<"div"> & {
    diceSumOptions?: DiceSumOptions;
    onSelectDice: GameMoves["selectDice"];
}) => {
    if (!diceSumOptions) {
        throw new Error("assert false");
    }
    return (
        <div className={twMerge("flex flex-col", className)} {...props}>
            {diceSumOptions.map((option, i) => {
                const isSplit = isSumOptionSplit(option);
                return (
                    <div key={i}>
                        <div className="flex">
                            {isSplit ? (
                                <div className="flex flex-1 join gap-2">
                                    <GameButton
                                        className="text-xl flex-1 join-item rounded-l-full"
                                        onClick={() => {
                                            onSelectDice(i, 0);
                                        }}
                                        disabled={!option.enabled[0]}
                                    >
                                        {option.diceSums[0]}
                                    </GameButton>
                                    <GameButton
                                        className="text-xl flex-1 join-item rounded-r-full"
                                        onClick={() => {
                                            onSelectDice(i, 1);
                                        }}
                                        disabled={!option.enabled[1]}
                                    >
                                        {option.diceSums[1]}
                                    </GameButton>
                                </div>
                            ) : (
                                <GameButton
                                    className="text-xl flex-1 justify-around"
                                    onClick={() => {
                                        onSelectDice(i);
                                    }}
                                    disabled={
                                        !option.enabled[0] || !option.enabled[1]
                                    }
                                >
                                    <span>{option.diceSums[0]}</span>
                                    <span>{option.diceSums[1]}</span>
                                </GameButton>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const GameActions = (
    props: ComponentProps<"div"> &
        Pick<Ctx, "activePlayers" | "currentPlayer"> &
        Pick<MyGameState, "diceSumOptions" | "currentPositions"> & {
            moves: GameMoves;
            allCurrentPositionsBlocked: boolean;
        },
) => {
    const {
        activePlayers,
        currentPlayer,
        diceSumOptions,
        currentPositions,
        moves,
        allCurrentPositionsBlocked,
        ...rest
    } = props;
    if (activePlayers?.[currentPlayer]) {
        switch (activePlayers[currentPlayer]) {
            case "rolling":
                return (
                    <RollingActions
                        onRollDice={moves.rollDice}
                        onStop={moves.stop}
                        showStop={_.size(currentPositions) !== 0}
                        showRoll={_.size(currentPositions) < NUM_DICE_CHOICE || !allCurrentPositionsBlocked}
                        {...rest}
                    />
                );
            case "selecting":
                return (
                    <SelectingActions
                        diceSumOptions={diceSumOptions}
                        onSelectDice={moves.selectDice}
                        {...rest}
                    />
                );
        }
    }
};
