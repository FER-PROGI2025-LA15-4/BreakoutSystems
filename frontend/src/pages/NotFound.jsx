import React from "react";
import { NavLink } from "react-router-dom";
import PageTemplate from "./PageTemplate";
import PageNavLink1 from "../components/PageNavLink1";

function NotFoundContent() {
  return (
    <div className="nf-body" role="main">
        <div>
          <h1 id="nf-title" className="nf-code">
            404
          </h1>

          <p className="nf-message">Stranica koju tražite ne postoji</p>

          <NavLink to="/" className="nf-back-btn">
            Povratak na početnu
          </NavLink>
        </div>

        <div className="nf-body-img"></div>
    </div>
  );
}

function NotFoundPage() {
    return <PageTemplate name="not-found" body={<NotFoundContent />} />;
}

export default NotFoundPage;
