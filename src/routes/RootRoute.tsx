import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

export const RootRoute = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Function to generate a random match ID
        const generateMatchId = () => {
            // Example: Generate a random string as match ID
            return Math.random().toString(36).substring(2, 10);
        };

        // Generate a random match ID
        const matchId = generateMatchId();

        // Navigate to the GameRoute with the generated match ID
        navigate(`/${matchId}`);
    }, [navigate]);

    return (
        <div className="flex flex-col w-full place-items-center h-dvh text-center p-5 gap-2 overflow-auto prose prose-stone max-w-none">
            {/* Header */}
            <div className="flex flex-row items-center gap-2">
                <h1 className="mb-0 text-3xl font-medium">Dicey Darts</h1>
            </div>
            <Outlet />
        </div>
    );
};
