import React from "react";
import PageTemplate from "./PageTemplate";

function HomePage() {
    const name = "home";
    const body = <p>Hello home</p>;
    return <PageTemplate name={name} body={body}/>;
}

export default HomePage;
