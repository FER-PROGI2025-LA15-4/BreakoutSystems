import React, {useEffect} from "react";
import { useState } from "react";
import { NavLink } from "react-router";
import logo from "../assets/images/logo.png";
import profileIcon from "../assets/icons/user-profile.svg"

function Header(props) {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <header className="header">
            <div className="header-logo-div">
                <NavLink to="/" className="header-logo">
                    <img src={logo} alt="Logo BreakoutSystems platforme" className="header-logo-img"/>
                </NavLink>
                <HeaderMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen}></HeaderMenu>
            </div>
            <div id={menuOpen ? "header-nav-open" : ""} className="header-nav">
                <NavLink to="/"
                         className={"header-nav-link" + (props.page === "home" ? " header-nav-link-active" : "")}>
                    <p>Početna</p>
                    <div></div>
                </NavLink>
                <NavLink to="/escape-rooms" className={"header-nav-link" + (props.page === "escape-rooms" ? " header-nav-link-active" : "")}>
                    <p>Escape Rooms</p>
                    <div></div>
                </NavLink>
                <NavLink to="/leaderboard"
                         className={"header-nav-link" + (props.page === "leaderboard" ? " header-nav-link-active" : "")}>
                    <p>Leaderboard</p>
                    <div></div>
                </NavLink>
                <NavLink to="/profile" id="header-nav-link-profile" className={"header-nav-link" + (props.page === "profile" ? " header-nav-link-active" : "")}>
                    <p>Moj profil</p>
                    <div></div>
                </NavLink>
            </div>
            <NavLink to="/profile" className="header-profile">
                <div><img src={profileIcon} alt="Profilna ikona"/></div>
            </NavLink>
        </header>
    );
}

function HeaderMenu({menuOpen, setMenuOpen}) {
    useEffect(() => {
        setMenuOpen(false);
    }, []);
    return (
        <div className="header-menu-icon" onClick={() => setMenuOpen(!menuOpen)} on>
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
}

export default Header;
