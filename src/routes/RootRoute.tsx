import { Outlet } from "react-router-dom";
import { SettingsMenu } from "../components/SettingsMenu";

export const RootRoute = () => {
    return (
        <div className="flex flex-col w-full place-items-center h-dvh text-center p-5 gap-2 overflow-auto prose prose-stone max-w-none">
            {/* Header */}
            <div className="flex flex-row items-center gap-2">
                <h1 className="mb-0 text-3xl font-medium">Dicey Darts</h1>
                <SettingsMenu />
            </div>
            <Outlet />
        </div>
    );
};
