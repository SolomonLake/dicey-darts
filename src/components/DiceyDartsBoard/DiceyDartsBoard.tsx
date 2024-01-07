import { BoardProps } from "boardgame.io/react";
import { MyGameState } from "../../Game";
import { DiceSumOptions, isSumOptionSplit } from "../../diceSumOptions";
import { DiceyButton } from "../DiceyButton/DiceyButton";

const RollingActions = ({
    onRollDice,
    onStop,
}: {
    onRollDice: () => void;
    onStop: () => void;
}) => {
    return (
        <div>
            <DiceyButton
                className=""
                onClick={() => {
                    onRollDice();
                }}
            >
                Roll Dice
            </DiceyButton>
            <DiceyButton
                onClick={() => {
                    onStop();
                }}
            >
                Stop
            </DiceyButton>
        </div>
    );
};

const SelectingActions = ({
    diceSumOptions,
    onSelectDice,
}: {
    diceSumOptions?: DiceSumOptions;
    onSelectDice: (diceSplitIndex: number, choiceIndex?: number) => void;
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
                                <DiceyButton
                                    onClick={() => {
                                        onSelectDice(i, 0);
                                    }}
                                >
                                    Select {option.diceSums[0]}
                                </DiceyButton>
                                <DiceyButton
                                    onClick={() => {
                                        onSelectDice(i, 1);
                                    }}
                                >
                                    Select {option.diceSums[1]}
                                </DiceyButton>
                            </>
                        ) : (
                            <DiceyButton
                                onClick={() => {
                                    onSelectDice(i);
                                }}
                            >
                                Select {option.diceSums[0]} and{" "}
                                {option.diceSums[1]}
                            </DiceyButton>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export const DiceyDartsBoard = (props: BoardProps<MyGameState>) => {
    console.log("G", props);
    const { ctx, moves, G } = props;
    if (ctx.activePlayers?.[ctx.currentPlayer]) {
        switch (ctx.activePlayers[ctx.currentPlayer]) {
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
                        diceSumOptions={G.diceSumOptions}
                        onSelectDice={moves.selectDice}
                    />
                );
        }
    }

    return <div>Starting Game...</div>;
};
