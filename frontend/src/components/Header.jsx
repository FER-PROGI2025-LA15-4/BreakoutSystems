import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/images/logo.png";
import profileIcon from "../assets/icons/user-profile.svg";

function Header(props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="header-logo-div">
          <NavLink to="/" className="header-logo">
            <img
              src={logo}
              alt="Logo BreakoutSystems platforme"
              className="header-logo-img"
            />
          </NavLink>
          <HeaderMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        </div>

        <div
          id={menuOpen ? "header-nav-open" : ""}
          className="header-nav"
        >
          <NavLink
            to="/"
            className={
              "header-nav-link" +
              (props.page === "home" ? " header-nav-link-active" : "")
            }
          >
            <p>Početna</p>
            <div></div>
          </NavLink>

          <NavLink to="/rooms" className="header-nav-link">
            <p>Escape Rooms</p>
            <div></div>
          </NavLink>

          <NavLink
            to="/leaderboard"
            className={
              "header-nav-link" +
              (props.page === "leaderboard" ? " header-nav-link-active" : "")
            }
          >
            <p>Leaderboard</p>
            <div></div>
          </NavLink>

          <NavLink
            to="/link"
            id="header-nav-link-profile"
            className="header-nav-link"
          >
            <p>Moj profil</p>
            <div></div>
          </NavLink>
        </div>

        <NavLink to="/profile" className="header-profile">
          <div>
            <img src={profileIcon} alt="Profilna ikona" />
          </div>
        </NavLink>
      </div>
    </header>
  );
}

function HeaderMenu({ menuOpen, setMenuOpen }) {
  useEffect(() => {
    setMenuOpen(false);
  }, []);

  return (
    <div
      className="header-menu-icon"
      onClick={() => setMenuOpen(!menuOpen)}
    >
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

export default Header;
