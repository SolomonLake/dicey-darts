import { Ctx } from "boardgame.io";
import { GameButton } from "./GameButton";
import { GameMoves, DiceyDartsGameState, TurnPhase } from "../Game";
import { DiceSumOptions, isSumOptionSplit } from "../diceSumOptions";
import { twMerge } from "tailwind-merge";
import { ComponentProps, useEffect, useState } from "react";
import _, { set } from "lodash";
import { NUM_DICE_CHOICE } from "../constants";
import Icon from "@mdi/react";
import { mdiAlertCircleOutline } from "@mdi/js";
import { PLAYER_BG_COLORS, PLAYER_BG_TEXT_COLORS } from "../colorConstants";

const RollingActions = ({
    onRollDice,
    onStop,
    showStop,
    gameEndWarning,
    showRoll,
    wasBust,
    className,
    playerTurnPhase,
    ...props
}: ComponentProps<"div"> & {
    onRollDice: GameMoves["rollDice"];
    onStop: GameMoves["stop"];
    showStop: boolean;
    gameEndWarning: boolean;
    showRoll: boolean;
    wasBust: boolean;
    playerTurnPhase: string;
}) => {
    if (!showStop && !showRoll) {
        throw Error("assert false");
    }
    const [actionLoading, setActionLoading] = useState(false);
    useEffect(() => {
        setActionLoading(false);
    }, [playerTurnPhase]);
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
                        setActionLoading(true);
                    }}
                    disabled={actionLoading}
                >
                    Roll Dice
                </GameButton>
            )}
            {showStop && (
                <GameButton
                    onClick={() => {
                        onStop();
                        setActionLoading(true);
                    }}
                    disabled={actionLoading}
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
        Pick<Ctx, "currentPlayer" | "playOrder"> &
        Pick<
            DiceyDartsGameState,
            "diceSumOptions" | "currentPositions" | "diceValues"
        > & {
            moves: GameMoves;
            allCurrentPositionsBlocked: boolean;
            wasBust: boolean;
            gameEndWarning: boolean;
            turnPhase: TurnPhase | undefined;
        },
) => {
    const {
        currentPlayer,
        diceSumOptions,
        currentPositions,
        diceValues,
        moves,
        wasBust,
        turnPhase,
        allCurrentPositionsBlocked,
        gameEndWarning,
        playOrder,
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
                    playerTurnPhase={currentPlayer + turnPhase}
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

    const playerIndex = playOrder.indexOf(currentPlayer);
    const diceBgColor = PLAYER_BG_COLORS[playerIndex % 4];
    const diceBgTextColor = PLAYER_BG_TEXT_COLORS[playerIndex % 4];

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
                                    "mask mask-triangle text-2xl flex justify-center items-center aspect-[174/149]",
                                    topHalf && "self-end",
                                    diceBgColor,
                                    diceBgTextColor,
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
