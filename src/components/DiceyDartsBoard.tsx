import { BoardProps } from "boardgame.io/react";
import { DiceyDartsGameState } from "../Game";
import { SettingsMenu } from "./SettingsMenu";
import { ConfiguringGame } from "./ConfiguringGame";
import { PlayingGame } from "./PlayingGame";

export type MyGameBoardProps = BoardProps<DiceyDartsGameState>;

export const DiceyDartsBoard = (props: MyGameBoardProps) => {
    const { ctx, moves, G } = props;

    return (
        <div className="h-full flex justify-center">
            <SettingsMenu
                configureGame={moves.configureGame}
                setPassAndPlay={moves.setPassAndPlay}
                passAndPlay={G.passAndPlay}
            />
            {ctx.phase === "configuringGame" && <ConfiguringGame {...props} />}
            {ctx.phase !== "configuringGame" && <PlayingGame {...props} />}
        </div>
    );
};
