import { useRouteError } from "react-router-dom";

export const ErrorRoute = () => {
    const error = useRouteError();
    console.error(error);

    return (
        <div id="error-page">
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            <a href="/" className="link">
                Return to the homepage
            </a>
        </div>
    );
};
