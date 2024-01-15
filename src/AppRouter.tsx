import { createHashRouter, RouterProvider } from "react-router-dom";
import { ErrorRoute } from "./routes/ErrorRoute.tsx";
import { GameRoute } from "./routes/GameRoute.tsx";
import { RootRoute } from "./routes/RootRoute.tsx";
import { LobbyCreationRoute } from "./routes/LobbyCreationRoute.tsx";

const router = createHashRouter([
    {
        path: "/",
        element: <RootRoute />,
        errorElement: <ErrorRoute />,
        children: [
            {
                errorElement: <ErrorRoute />,
                children: [
                    {
                        index: true,
                        element: <LobbyCreationRoute />,
                    },
                    {
                        path: ":lobbyId",
                        element: <GameRoute />,
                    },
                ],
            },
        ],
    },
]);

export const AppRouter = () => {
    return <RouterProvider router={router} />;
};
