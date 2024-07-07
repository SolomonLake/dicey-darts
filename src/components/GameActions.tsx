import { Ctx } from "boardgame.io";
import { GameButton } from "./GameButton";
import { GameMoves, DiceyDartsGameState, TurnPhase } from "../Game";
import { DiceSumOptions, isSumOptionSplit } from "../diceSumOptions";
import { twMerge } from "tailwind-merge";
import { ComponentProps, useEffect, useRef, useState } from "react";
import _, { set, transform } from "lodash";
import { NUM_DICE_CHOICE } from "../constants";
import Icon from "@mdi/react";
import {
    mdiAlertCircleOutline,
    mdiAlertOctagramOutline,
    mdiCrownOutline,
    mdiDiceMultipleOutline,
} from "@mdi/js";
import { PLAYER_BG_COLORS, PLAYER_BG_TEXT_COLORS } from "../colorConstants";
import { useWindowSize } from "@react-hook/window-size";

const RollingActions = ({
    onRollDice,
    onStop,
    showStop,
    gameEndWarning,
    gameWinAlert,
    rollingOneAlert,
    showRoll,
    wasBust,
    className,
    playerTurnPhase,
    actionsDisabled,
    ...props
}: ComponentProps<"div"> & {
    onRollDice: GameMoves["rollDice"];
    onStop: GameMoves["stop"];
    showStop: boolean;
    gameEndWarning: boolean;
    gameWinAlert: boolean;
    rollingOneAlert: boolean;
    showRoll: boolean;
    wasBust: boolean;
    playerTurnPhase: string;
    actionsDisabled: boolean;
}) => {
    const [actionLoading, setActionLoading] = useState(false);
    const [rollingAnimation, setRollingAnimation] = useState(false);
    useEffect(() => {
        setActionLoading(false);
    }, [playerTurnPhase]);
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
                    className={twMerge(
                        "w-full",
                        rollingOneAlert && "btn-outline",
                    )}
                    onClick={() => {
                        // onRollDice();
                        // setActionLoading(true);
                        setRollingAnimation(true);
                        setTimeout(() => {
                            // onRollDice();
                            // setActionLoading(true);
                            setRollingAnimation(false);
                        }, 2000);
                    }}
                    disabled={actionLoading || actionsDisabled}
                >
                    {rollingOneAlert ? (
                        <Icon path={mdiAlertCircleOutline} size={1} />
                    ) : (
                        <Icon path={mdiDiceMultipleOutline} size={1} />
                    )}
                    Roll Dice
                </GameButton>
            )}
            {showStop && (
                <GameButton
                    onClick={() => {
                        onStop();
                        setActionLoading(true);
                    }}
                    disabled={actionLoading || actionsDisabled}
                    className={twMerge(gameEndWarning && "btn-outline")}
                >
                    {gameEndWarning && (
                        <Icon path={mdiAlertOctagramOutline} size={1} />
                    )}
                    {gameWinAlert && <Icon path={mdiCrownOutline} size={1} />}
                    Stop
                </GameButton>
            )}
        </div>
    );
};

const SelectingActions = ({
    diceSumOptions,
    onSelectDice,
    playerTurnPhase,
    actionsDisabled,
    className,
    ...props
}: ComponentProps<"div"> & {
    diceSumOptions?: DiceSumOptions;
    playerTurnPhase: string;
    onSelectDice: GameMoves["selectDice"];
    actionsDisabled: boolean;
}) => {
    const [actionLoading, setActionLoading] = useState(false);
    useEffect(() => {
        setActionLoading(false);
    }, [playerTurnPhase]);
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
                                            setActionLoading(true);
                                            onSelectDice(i, 0);
                                        }}
                                        disabled={
                                            !option.enabled[0] ||
                                            actionLoading ||
                                            actionsDisabled
                                        }
                                    >
                                        {option.diceSums[0]}
                                    </GameButton>
                                    <GameButton
                                        className="text-xl flex-1 join-item rounded-r-full"
                                        onClick={() => {
                                            setActionLoading(true);
                                            onSelectDice(i, 1);
                                        }}
                                        disabled={
                                            !option.enabled[1] ||
                                            actionLoading ||
                                            actionsDisabled
                                        }
                                    >
                                        {option.diceSums[1]}
                                    </GameButton>
                                </div>
                            ) : (
                                <GameButton
                                    className="text-xl flex-1 justify-around"
                                    onClick={() => {
                                        setActionLoading(true);
                                        onSelectDice(i);
                                    }}
                                    disabled={
                                        !option.enabled[0] ||
                                        !option.enabled[1] ||
                                        actionLoading ||
                                        actionsDisabled
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
        Pick<Ctx, "currentPlayer" | "playOrder" | "activePlayers"> &
        Pick<
            DiceyDartsGameState,
            "diceSumOptions" | "currentPositions" | "diceValues"
        > & {
            moves: GameMoves;
            allCurrentPositionsBlocked: boolean;
            wasBust: boolean;
            gameEndWarning: boolean;
            gameWinAlert: boolean;
            rollingOneAlert: boolean;
            turnPhase: TurnPhase | undefined;
            playerId: string;
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
        gameWinAlert,
        rollingOneAlert,
        playOrder,
        activePlayers,
        playerId,
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
                    gameWinAlert={gameWinAlert}
                    rollingOneAlert={rollingOneAlert}
                    actionsDisabled={activePlayers?.[playerId] !== turnPhase}
                />
            );
            break;
        case "selecting":
            actions = (
                <SelectingActions
                    diceSumOptions={diceSumOptions}
                    onSelectDice={moves.selectDice}
                    playerTurnPhase={currentPlayer + turnPhase}
                    actionsDisabled={activePlayers?.[playerId] !== turnPhase}
                />
            );
            break;
    }

    const playerIndex = playOrder.indexOf(currentPlayer);
    const diceBgColor = PLAYER_BG_COLORS[playerIndex % 4];
    const diceBgTextColor = PLAYER_BG_TEXT_COLORS[playerIndex % 4];

    const [windowWidth, windowHeight] = useWindowSize();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [dimensionStyle, setDimensionStyle] = useState("w-full"); // default to width full
    const sideRef = useRef<HTMLDivElement>(null);
    const [sideX, setSideX] = useState(0);
    const [sideY, setSideY] = useState(0);

    useEffect(() => {
        if (containerRef.current) {
            const { width, height } =
                containerRef.current.getBoundingClientRect();
            if (width / height > 1000 / 866) {
                setDimensionStyle("h-full"); // container is wider than aspect ratio
            } else {
                setDimensionStyle("w-full"); // container is taller or equal to aspect ratio
            }

            // console.log(containerRef.current.clientWidth);
            setContainerWidth(width);
            const { width: sideWidth, height: sideHeight } =
                sideRef.current?.getBoundingClientRect() || {
                    width: 0,
                    height: 0,
                };
            console.log("Side x", sideWidth);
            console.log("Side y", sideHeight);
            setSideX(sideWidth);
            setSideY(sideHeight);
        }
    }, [windowWidth, windowHeight, containerRef.current]);

    return (
        <div {...rest}>
            {diceValues.length > 0 && (
                <div className="grid grid-cols-2 flex-1 gap-3]">
                    {diceValues.map((diceValue, i) => {
                        const topHalf = i < diceValues.length / 2;
                        const showSide: {
                            [diceNumber: number]: React.CSSProperties;
                        } = {
                            1: {},
                            2: {
                                transform:
                                    "rotate3d(1, 0, 0, -109deg) rotate3d(0, 0, 1, 60deg)",
                                // transformOrigin: "top right",
                            },
                            3: {
                                // translate3d(-6%, 39%, 0px)
                                transform:
                                    "rotate3d(1, 0, 0, -109deg) rotate3d(0, 0, 1, -60deg)",
                            },
                            4: {
                                // translate3d(0%, 33%, 0px)
                                transform:
                                    "rotate3d(1, 0, 0, 70deg) rotate3d(0, 1, 0, 180deg)",
                                transformOrigin: "0px 30% 0px",
                            },
                        };
                        return (
                            <div
                                key={i}
                                className="relative transform transition duration-1000"
                                ref={containerRef}
                                style={{
                                    transformStyle: "preserve-3d",
                                    ...showSide[diceValue],
                                }}
                            >
                                {[
                                    {
                                        style: {},
                                    },
                                    {
                                        style: {
                                            transform:
                                                "rotate3d(0, 0, 1, -60deg) rotate3d(1, 0, 0, 109deg)",
                                            transformOrigin: "bottom left",
                                        },
                                    },
                                    {
                                        style: {
                                            transform:
                                                "rotate3d(0, 0, 1, 60deg) rotate3d(1, 0, 0, 109deg)",
                                            transformOrigin: "bottom right",
                                            // transform:
                                            //     "translate3d(15%, 5%, 0px) rotate3d(0, 0, 1, 60deg) rotate3d(1, 0, 0, 109deg)",
                                        },
                                    },
                                    {
                                        style: {
                                            transformOrigin: "bottom",
                                            transform:
                                                "rotate3d(1, 0, 0, 70deg) rotate3d(0, 1, 0, 180deg)",
                                        },
                                    },
                                ].map((side, sideIndex) => (
                                    <div
                                        {...(i === 0 && sideIndex === 0
                                            ? { ref: sideRef }
                                            : {})}
                                        key={`${i}-${sideIndex}`}
                                        style={{
                                            ...side.style,
                                            // backfaceVisibility: "hidden",
                                            clipPath:
                                                "polygon(50% 0%, 0% 100%, 100% 100%)",
                                        }}
                                        // aspect-[1000/866]
                                        className={twMerge(
                                            "absolute border-base-200 rounded-lg text-2xl flex justify-center items-center aspect-[1000/866]",
                                            topHalf && "self-end",
                                            dimensionStyle,
                                            dimensionStyle === "w-full"
                                                ? "top-[25%]"
                                                : "left-[7%]",
                                            diceBgColor,
                                            diceBgTextColor,
                                        )}
                                    >
                                        <span className="pt-4">
                                            {sideIndex + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            )}
            {actions}
        </div>
    );
};
