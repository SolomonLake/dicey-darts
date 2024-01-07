import { Ctx } from "boardgame.io";
import { GameButton } from "../DiceyButton/GameButton";
import { GameMoves, MyGameState } from "../../Game";
import { DiceSumOptions, isSumOptionSplit } from "../../diceSumOptions";

const RollingActions = ({
    onRollDice,
    onStop,
}: {
    onRollDice: GameMoves["rollDice"];
    onStop: GameMoves["stop"];
}) => {
    return (
        <div>
            <GameButton
                className=""
                onClick={() => {
                    onRollDice();
                }}
            >
                Roll Dice
            </GameButton>
            <GameButton
                onClick={() => {
                    onStop();
                }}
            >
                Stop
            </GameButton>
        </div>
    );
};

const SelectingActions = ({
    diceSumOptions,
    onSelectDice,
}: {
    diceSumOptions?: DiceSumOptions;
    onSelectDice: GameMoves["selectDice"];
}) => {
    if (!diceSumOptions) {
        throw new Error("assert false");
    }
    return (
        <div>
            {diceSumOptions.map((option, i) => {
                const isSplit = isSumOptionSplit(option);
                return (
                    <div key={i}>
                        {isSplit ? (
                            <>
                                <GameButton
                                    onClick={() => {
                                        onSelectDice(i, 0);
                                    }}
                                >
                                    Select {option.diceSums[0]}
                                </GameButton>
                                <GameButton
                                    onClick={() => {
                                        onSelectDice(i, 1);
                                    }}
                                >
                                    Select {option.diceSums[1]}
                                </GameButton>
                            </>
                        ) : (
                            <GameButton
                                onClick={() => {
                                    onSelectDice(i);
                                }}
                            >
                                Select {option.diceSums[0]} and{" "}
                                {option.diceSums[1]}
                            </GameButton>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export const GameActions = (
    props: Pick<Ctx, "activePlayers" | "currentPlayer"> &
        Pick<MyGameState, "diceSumOptions"> & { moves: GameMoves },
) => {
    const { activePlayers, currentPlayer, diceSumOptions, moves } = props;
    if (activePlayers?.[currentPlayer]) {
        switch (activePlayers[currentPlayer]) {
            case "rolling":
                return (
                    <RollingActions
                        onRollDice={moves.rollDice}
                        onStop={moves.stop}
                    />
                );
            case "selecting":
                return (
                    <SelectingActions
                        diceSumOptions={diceSumOptions}
                        onSelectDice={moves.selectDice}
                    />
                );
        }
    }
};
