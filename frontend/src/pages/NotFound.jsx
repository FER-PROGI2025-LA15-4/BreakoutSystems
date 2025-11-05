import React from "react";
import PageTemplate from "./PageTemplate";
import PageNavLink1 from "../components/PageNavLink1";

function NotFoundPage() {
    const name = "not-found";
    const body = <div className="not-found-body">
        <h1>Greška 404</h1>
        <p>Stranica koju tražite ne postoji</p>
        <PageNavLink1 to="/" text="POČETNA STRANICA"/>
    </div>;
    return <PageTemplate name={name} body={body}/>;
}

export default NotFoundPage;
