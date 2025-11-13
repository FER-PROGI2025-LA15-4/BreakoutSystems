import React from 'react';
import PageTemplate from "./PageTemplate";
import loginLogo from "../assets/icons/sign-in.svg";
import githubLogo from "../assets/icons/github-logo.svg";
import registerLogo from "../assets/icons/address-card.svg";
import {NavLink} from "react-router-dom";

function LoginPage() {
    const name = "login";

    const body = (
        <div className="login-background">
            <div className="login-container">
                <img src={loginLogo} alt="login logo"/>
                <h2>Prijavi se!</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <a href={"/api/auth/login"} className={"login-link"}>
                    <img src={githubLogo} alt="github logo"/>
                    <p>PRIJAVA</p>
                </a>
            </div>
            <div className="register-container">
                <img src={registerLogo} alt="register logo"/>
                <h2>Registriraj se!</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <NavLink to={"/register"} className={"login-link"}>REGISTRACIJA</NavLink>
            </div>
        </div>
    );

    return <PageTemplate name={name} body={body} />;

}

export default LoginPage;
