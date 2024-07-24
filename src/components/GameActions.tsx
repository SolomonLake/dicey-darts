import { Ctx } from "boardgame.io";
import { GameButton } from "./GameButton";
import { GameMoves, DiceyDartsGameState, TurnPhase } from "../Game";
import { DiceSumOptions, isSumOptionSplit } from "../diceSumOptions";
import { twMerge } from "tailwind-merge";
import {
    ComponentProps,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import _ from "lodash";
import { NUM_DICE_CHOICE } from "../constants";
import Icon from "@mdi/react";
import {
    mdiAlertCircleOutline,
    mdiAlertOctagramOutline,
    mdiCrownOutline,
    mdiDiceMultipleOutline,
} from "@mdi/js";
import {
    PLAYER_BG_COLORS,
    PLAYER_BG_TEXT_COLORS,
    PLAYER_BORDER_COLORS,
} from "../colorConstants";
import { useWindowSize } from "@react-hook/window-size";
import { useDiceSpinSpeed } from "../contexts/DiceSpinSpeedContext";

const RollingActions = ({
    onRollDice,
    onStop,
    showStop,
    gameEndWarning,
    gameWinAlert,
    rollingOneAlert,
    currentPositions,
    currentPositionsBlocked,
    showRoll,
    wasBust,
    className,
    playerTurnPhase,
    actionsDisabled,
    ...props
}: ComponentProps<"div"> &
    Pick<DiceyDartsGameState, "currentPositions"> & {
        onRollDice: GameMoves["rollDice"];
        onStop: GameMoves["stop"];
        showStop: boolean;
        gameEndWarning: boolean;
        gameWinAlert: boolean;
        rollingOneAlert: boolean;
        currentPositionsBlocked: number[];
        showRoll: boolean;
        wasBust: boolean;
        playerTurnPhase: string;
        actionsDisabled: boolean;
    }) => {
    const [actionLoading, setActionLoading] = useState(false);
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
                <div>
                    <GameButton
                        className={twMerge(
                            "w-full",
                            rollingOneAlert && "btn-outline",
                        )}
                        onClick={() => {
                            onRollDice();
                            setActionLoading(true);
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
                    {rollingOneAlert && (
                        <span className="text-error inline-flex leading-snug">
                            Roll a sum of{" "}
                            {
                                _.keys(currentPositions).filter(
                                    (sum) =>
                                        !currentPositionsBlocked.includes(
                                            parseInt(sum),
                                        ),
                                )[0]
                            }{" "}
                            or you will BUST!
                        </span>
                    )}
                </div>
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
            currentPositionsBlocked: number[];
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
        currentPositionsBlocked,
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
                    currentPositions={currentPositions}
                    currentPositionsBlocked={currentPositionsBlocked}
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
    const [dimensionStyle, setDimensionStyle] = useState("w-full"); // default to width full
    const sideRef = useRef<HTMLDivElement>(null);
    const [sideX, setSideX] = useState(0);
    const [sideY, setSideY] = useState(0);

    const GX = sideX / 2;
    const GY = sideY - ((Math.sqrt(3) / 3) * sideX) / 2;
    const GZ = ((Math.sqrt(2) / Math.sqrt(3)) * sideX) / 4;
    const tOrigin = `${GX}px ${GY}px ${GZ}px`;
    const centroidY = (Math.sqrt(3) / 3) * sideX;

    const throttledUpdateSideDimensions = useRef(
        _.throttle((cRef, sRef) => {
            if (cRef.current) {
                const { width, height } = cRef.current.getBoundingClientRect();
                if (width / height > 1000 / 866) {
                    setDimensionStyle("h-full"); // container is wider than aspect ratio
                } else {
                    setDimensionStyle("w-full"); // container is taller or equal to aspect ratio
                }
                const { width: sideWidth, height: sideHeight } =
                    sRef.current?.getBoundingClientRect() || {
                        width: 0,
                        height: 0,
                    };
                setSideX(sideWidth);
                setSideY(sideHeight);
            }
        }, 100),
    );

    useEffect(() => {
        throttledUpdateSideDimensions.current(containerRef, sideRef);
        setTimeout(() => {
            throttledUpdateSideDimensions.current(containerRef, sideRef);
        }, 100);
    }, [windowWidth, windowHeight, containerRef.current]);

    const [spinning, setSpinning] = useState(turnPhase === "selecting");
    const [initializeSpinning, setInitializeSpinning] = useState(false);

    useEffect(() => {
        if (turnPhase === "selecting") {
            setInitializeSpinning(true);
            setTimeout(() => {
                setSpinning(true);
                setInitializeSpinning(false);
                setTimeout(() => setSpinning(false), 1000);
            }, 5);
        }
    }, [turnPhase]);

    const { diceSpinSpeed } = useDiceSpinSpeed();

    const otherValues = diceValues.map((dv) => {
        // return value between 1 and 4, that is not dv
        const result = _.random(1, 4);
        if (result === dv) {
            if (dv === 1) {
                return dv + 1;
            } else {
                return dv - 1;
            }
        } else {
            return result;
        }
    });

    return (
        <div {...rest}>
            {diceValues.length > 0 && (
                <div className={twMerge("grid grid-cols-2 flex-1 gap-3]")}>
                    {diceValues.map((diceValue, i) => {
                        const topHalf = i < diceValues.length / 2;
                        // 1. get new values
                        // 2. set dice to different value than new
                        // 3. animate dice to new value

                        const sideToShow =
                            initializeSpinning && diceSpinSpeed !== 0
                                ? otherValues[i]
                                : diceValue;

                        const showSide: {
                            [diceNumber: number]: React.CSSProperties;
                        } = {
                            1: {
                                transform:
                                    diceSpinSpeed === 2
                                        ? `rotate3d(1, 0, 0, 360deg) rotate3d(0, 0, 1, 360deg)`
                                        : "",
                                transformOrigin: tOrigin,
                            },
                            2: {
                                // -109.5 and 60
                                transform:
                                    diceSpinSpeed === 2
                                        ? `rotate3d(1, 0, 0, -469.5deg) rotate3d(0, 0, 1, 420deg) translate3d(0, 0, ${sideX - centroidY}px)`
                                        : `rotate3d(1, 0, 0, -109.5deg) rotate3d(0, 0, 1, 60deg) translate3d(0, 0, ${sideX - centroidY}px)`,
                                transformOrigin: tOrigin,
                            },
                            3: {
                                // -109.5 and -60
                                transform:
                                    diceSpinSpeed === 2
                                        ? `rotate3d(1, 0, 0, -469.5deg) rotate3d(0, 0, 1, -420deg) translate3d(0, 0, ${sideX - centroidY}px)`
                                        : `rotate3d(1, 0, 0, -109.5deg) rotate3d(0, 0, 1, -60deg) translate3d(0, 0, ${sideX - centroidY}px)`,
                                transformOrigin: tOrigin,
                            },
                            4: {
                                // 70 and 180
                                transform:
                                    diceSpinSpeed === 2
                                        ? `rotate3d(1, 0, 0, 430deg) rotate3d(0, 1, 0, 540deg) translate3d(0, 0, ${sideX - centroidY}px)`
                                        : `rotate3d(1, 0, 0, 70deg) rotate3d(0, 1, 0, 180deg) translate3d(0, 0, ${sideX - centroidY}px)`,
                                transformOrigin: tOrigin,
                            },
                        };
                        return (
                            <div className="relative" key={i}>
                                <div
                                    {...(i === 0 ? { ref: containerRef } : {})}
                                    className={twMerge(
                                        "absolute w-full h-full",
                                    )}
                                >
                                    <div
                                        {...(i === 0 ? { ref: sideRef } : {})}
                                        className={twMerge(
                                            "absolute aspect-[1000/866]",
                                            dimensionStyle,
                                        )}
                                    />
                                </div>
                                <div
                                    className={twMerge(
                                        "relative transform transition h-full w-full",
                                        spinning
                                            ? "duration-1000"
                                            : "duration-0",
                                    )}
                                    style={{
                                        transformStyle: "preserve-3d",
                                        ...showSide[sideToShow],
                                    }}
                                >
                                    {[
                                        {
                                            style: {},
                                        },
                                        {
                                            style: {
                                                transform: `rotate3d(0, 0, 1, -60deg) rotate3d(1, 0, 0, 109.5deg)`,
                                                transformOrigin: "bottom left",
                                            },
                                        },
                                        {
                                            style: {
                                                transform: `rotate3d(0, 0, 1, 60deg) rotate3d(1, 0, 0, 109.5deg)`,
                                                transformOrigin: "bottom right",
                                            },
                                        },
                                        {
                                            style: {
                                                transform: `rotate3d(1, 0, 0, 70.53deg) rotate3d(0, 1, 0, 180deg)`,
                                                transformOrigin: "bottom",
                                            },
                                        },
                                    ].map((side, sideIndex) => (
                                        <div
                                            key={`${i}-${sideIndex}`}
                                            style={{
                                                ...side.style,
                                                backfaceVisibility: "hidden",
                                                clipPath: `polygon(50% 0%, 100% 100%, 0% 100%)`,
                                            }}
                                            className={twMerge(
                                                "absolute text-2xl flex justify-center items-center aspect-[1000/866]",
                                                topHalf && "self-end",
                                                dimensionStyle,
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
                            </div>
                        );
                    })}
                </div>
            )}
            {actions}
        </div>
    );
};
