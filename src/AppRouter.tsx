import { createHashRouter, RouterProvider } from "react-router-dom";
import { ErrorRoute } from "./routes/ErrorRoute.tsx";
import { GameRoute } from "./routes/GameRoute.tsx";
import { RootRoute } from "./routes/RootRoute.tsx";
import { MatchCreationRoute } from "./routes/MatchCreationRoute.tsx";

const router = createHashRouter([
    {
        path: "/",
        element: <RootRoute />,
        errorElement: <ErrorRoute />,
        children: [
            {
                errorElement: <ErrorRoute />,
                children: [
                    // {
                    //     index: true,
                    //     element: <MatchCreationRoute />,
                    // },
                    {
                        path: ":matchId",
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
