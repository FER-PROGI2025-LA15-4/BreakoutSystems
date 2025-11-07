import React from "react";
import logo from "../assets/images/logo.png";
import fer_logo from "../assets/images/FER-logo.svg";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <img
          src={logo}
          alt="Logo BreakoutSystems platforme"
          className="footer-logo-img"
        />

        <div className="footer-msg">
          <p>
            Ova platforma izrađena je u sklopu projekta iz kolegija Programsko
            inženjerstvo na Fakultetu elektrotehnike i računarstva.
          </p>
          <p>&copy; 2025. BreakoutSystems (ekipa TG15.4)</p>
        </div>

        <img
          src={fer_logo}
          alt="Logo Fakulteta elektrotehnike i računarstva, Sveučilište u Zagrebu"
          className="footer-fer-logo-img"
        />
      </div>
    </footer>
  );
}

export default Footer;
