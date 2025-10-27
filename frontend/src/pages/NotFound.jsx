import React from "react";
import PageTemplate from "./PageTemplate";

function NotFoundPage() {
    const name = "not-found";
    const body = <p><h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p></p>;
    return <PageTemplate name={name} body={body}/>;
}

export default NotFoundPage;
