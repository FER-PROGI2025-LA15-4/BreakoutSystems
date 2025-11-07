import React from "react";
import { NavLink } from "react-router-dom";
import PageTemplate from "./PageTemplate";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1520975922284-9d09d07c8a09?q=80&w=1200&auto=format&fit=crop"; // privremeno

function NotFoundContent() {
  return (
    <div className="nf-page" role="main">
      <section className="nf-hero" aria-labelledby="nf-title">
        <div className="nf-col nf-left">
          <h1 id="nf-title" className="nf-code" aria-label="404">
            404
          </h1>

          <p className="nf-message">Stranica koju tražite ne postoji</p>

          <NavLink to="/" className="nf-back-btn">
            Povratak na početnu
          </NavLink>
        </div>

        <div className="nf-col nf-right" aria-hidden="true">
          <img
            src={FALLBACK_IMG}
            alt="Ilustracija: izgubljena osoba s mapom"
            className="nf-illustration"
          />
        </div>
      </section>
    </div>
  );
}

export default function NotFoundPage() {
  return <PageTemplate name="not-found" body={<NotFoundContent />} />;
}