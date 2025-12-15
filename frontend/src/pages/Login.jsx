import React, {useEffect} from 'react';
import { useState } from "react";
import PageTemplate from "./PageTemplate";
import loginLogo from "../assets/icons/sign-in.svg";
import githubLogo from "../assets/icons/github-logo.svg";
import registerLogo from "../assets/icons/address-card.svg";
import {NavLink, useNavigate} from "react-router-dom";
import Popup from "../components/Popup";
import {useAuth} from "../context/AuthContext";
import {SyncLoader} from "react-spinners";

function LoginPage() {
    const name = "login";

    const navigate = useNavigate();
    const { user, loading, authError, clearAuthError, login } = useAuth();

    useEffect(() => {
        if (user && !loading) {
            navigate("/profile", { replace: true });
        }
    }, [user, loading, navigate]);

    const [popupVisible, setPopupVisible] = useState(false);
    const errorMsgNoAccount = "nemate račun, registrirajte se prvo";
    const popup = <Popup title={"Oops, došlo je do greške!"} message={errorMsgNoAccount} onClose={() => setPopupVisible(false)} />;

    useEffect(() => {
        if (authError) {
            if (authError === "no_account") {
                setPopupVisible(true);
            } else {
                console.error("Unknown auth error: " + authError);
            }
            clearAuthError(); // reset auth error after handling
        }
    }, [authError]);

    let body;
    if (!user && !loading) {
        body = (
            <div className="login-background">
                {popupVisible && popup}
                <div className="login-container">
                    <img src={loginLogo} alt="login logo"/>
                    <h2>Prijavi se!</h2>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                    <a onClick={login} className={"login-link"}>
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
    } else {
        body =
            <div className="profile-page-loading">
                <SyncLoader className={"profile-page-loader"}/>
            </div>;
    }

    return <PageTemplate name={name} body={body} />;

}

export default LoginPage;
