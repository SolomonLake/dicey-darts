import { Ctx } from "boardgame.io";
import { GameButton } from "./GameButton";
import { GameMoves, DiceyDartsGameState, TurnPhase } from "../DiceyDartsGame";
import { DiceSumOptions, isSumOptionSplit } from "../diceSumOptions";
import { twMerge } from "tailwind-merge";
import { ComponentProps } from "react";
import _ from "lodash";
import { NUM_DICE_CHOICE } from "../constants";
import Icon from "@mdi/react";
import { mdiAlertCircleOutline } from "@mdi/js";

const RollingActions = ({
    onRollDice,
    onStop,
    showStop,
    gameEndWarning,
    showRoll,
    wasBust,
    className,
    ...props
}: ComponentProps<"div"> & {
    onRollDice: GameMoves["rollDice"];
    onStop: GameMoves["stop"];
    showStop: boolean;
    gameEndWarning: boolean;
    showRoll: boolean;
    wasBust: boolean;
}) => {
    if (!showStop && !showRoll) {
        throw Error("assert false");
    }
    return (
        <div
            className={twMerge(
                "flex-col flex flex-1 justify-center gap-3",
                className,
            )}
            {...props}
        >
            {wasBust && <h2 className="text-2xl my-0">BUST!</h2>}
            {showRoll && (
                <GameButton
                    className="w-full"
                    onClick={() => {
                        onRollDice();
                    }}
                >
                    Roll Dice
                </GameButton>
            )}
            {showStop && (
                <GameButton
                    onClick={() => {
                        onStop();
                    }}
                >
                    {gameEndWarning && (
                        <Icon path={mdiAlertCircleOutline} size={1} />
                    )}
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
        <div
            className={twMerge(
                "flex flex-col flex-1 justify-center gap-3",
                className,
            )}
            {...props}
        >
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
        Pick<
            DiceyDartsGameState,
            "diceSumOptions" | "currentPositions" | "diceValues"
        > & {
            moves: GameMoves;
            allCurrentPositionsBlocked: boolean;
            wasBust: boolean;
            gameEndWarning: boolean;
            turnPhase: TurnPhase;
        },
) => {
    const {
        diceSumOptions,
        currentPositions,
        diceValues,
        moves,
        wasBust,
        turnPhase,
        allCurrentPositionsBlocked,
        gameEndWarning,
        ...rest
    } = props;
    let actions = null;
    switch (turnPhase) {
        case "rolling":
            actions = (
                <RollingActions
                    onRollDice={moves.rollDice}
                    onStop={moves.stop}
                    showStop={_.size(currentPositions) !== 0}
                    showRoll={
                        _.size(currentPositions) < NUM_DICE_CHOICE ||
                        !allCurrentPositionsBlocked
                    }
                    wasBust={wasBust}
                    gameEndWarning={gameEndWarning}
                />
            );
            break;
        case "selecting":
            actions = (
                <SelectingActions
                    diceSumOptions={diceSumOptions}
                    onSelectDice={moves.selectDice}
                />
            );
            break;
    }

    return (
        <div {...rest}>
            {diceValues.length > 0 && (
                <div className="grid grid-cols-2 flex-1 gap-3">
                    {diceValues.map((diceValue, i) => {
                        const topHalf = i < diceValues.length / 2;
                        return (
                            <div
                                key={i}
                                className={twMerge(
                                    "mask mask-triangle text-2xl flex justify-center items-center bg-accent text-accent-content aspect-[174/149]",
                                    topHalf && "self-end",
                                )}
                            >
                                <span className="pt-4">{diceValue}</span>
                            </div>
                        );
                    })}
                </div>
            )}
            {actions}
        </div>
    );
};
