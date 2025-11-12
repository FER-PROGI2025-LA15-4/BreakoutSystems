import React from "react";
import PageTemplate from "./PageTemplate";
import registerLogo from "../assets/icons/address-card.svg"
import loginLogo from "../assets/icons/sign-in.svg"
import githubLogo from "../assets/icons/github-logo.svg"

function ProfilePage() {
    const name = "profile";
    const body = (
        <div className="login-background">
            <div className="login-container">
                <img src={loginLogo} alt="login logo"/>
                <h2>Prijavi se!</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <button>
                    <img src={githubLogo} alt="github logo"/>
                    <p>PRIJAVA</p>
                </button>
            </div>
            <div className="register-container">
                <img src={registerLogo} alt="register logo"/>
                <h2>Registriraj se!</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <button>REGISTRACIJA</button>
            </div>
        </div>
    );
    /*
    const body = <div>
        <a href="/auth/login">
            <button>helloo</button>
        </a>
        <a href="/auth/logout">
            <button>helloo</button>
        </a>
        <form method="POST" action="/select-user-type">
            <button type="submit" name="user_type" value="regular">reg</button>
            <button type="submit" name="user_type" value="creator">creator</button>
        </form>
    </div>;
    */
    return <PageTemplate name={name} body={body} />;
}

export default ProfilePage;
