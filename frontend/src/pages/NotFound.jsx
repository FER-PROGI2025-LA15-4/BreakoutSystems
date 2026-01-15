import React from "react";
import PageTemplate from "./PageTemplate";
import PageNavLink1 from "../components/PageNavLink1";

export function NotFoundContent() {
  return (
    <div className="nf-body" role="main">
        <div className="nf-body-container">
          <h1 id="nf-title" className="nf-code">404</h1>

          <p className="nf-message">Stranica koju tražite ne postoji</p>

          <PageNavLink1 to="/" text="POVRATAK NA POČETNU" className="nf-back-button" dark={true}/>
        </div>

        <div className="nf-body-img"></div>
    </div>
  );
}

function NotFoundPage() {
    return <PageTemplate name="not-found" body={<NotFoundContent />} />;
}

export default NotFoundPage;
