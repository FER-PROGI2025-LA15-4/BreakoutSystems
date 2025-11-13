import React from "react";
import { useState } from "react";
import PageTemplate from "./PageTemplate";
import registerLogo from "../assets/icons/address-card.svg"
import loginLogo from "../assets/icons/sign-in.svg"
import githubLogo from "../assets/icons/github-logo.svg"
import registerImage from "../assets/icons/user-settings.svg"

function ProfilePage() {
    const name = "profile";

    const profileLoginBody = (
        <div className="login-background">
            <div className="login-container">
                <img src={loginLogo} alt="login logo"/>
                <h2>Prijavi se!</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <a href={"/api/auth/login"}>
                    <img src={githubLogo} alt="github logo"/>
                    <p>PRIJAVA</p>
                </a>
            </div>
            <div className="register-container">
                <img src={registerLogo} alt="register logo"/>
                <h2>Registriraj se!</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <button>REGISTRACIJA</button>
            </div>
        </div>
    );

    const [selectedOption, setSelectedOption] = useState("");
    const handleRadioChange = (event) => {
        setSelectedOption(event.target.value);
    };
    const profileRegisterBody = (
        <div className="login-background">
            <div className="login-container register-form-container">
                <img src={registerImage} alt="login logo"/>
                <h2>Registracija</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

                <form action={"/api/auth/login"} method="POST" encType={"multipart/form-data"} className="register-form">
                    <div className={"register-form-element"}>
                        <label htmlFor="username">Korisničko ime</label><br/>
                        <input type="text" id="username" name="username" required={true}/>
                    </div>

                    <div className={"register-form-element-radio"}>
                        <p>Uloga</p><br/>
                        <label id="radio">
                            <input
                                name="uloga"
                                type="radio"
                                value="POLAZNIK"
                                checked={selectedOption === 'POLAZNIK'}
                                onChange={handleRadioChange}
                            />
                            Igrač
                        </label><br/>
                        <label id="radio">
                            <input
                                name="uloga"
                                type="radio"
                                value="VLASNIK"
                                checked={selectedOption === 'VLASNIK'}
                                onChange={handleRadioChange}
                            />
                            Vlasnik
                        </label>
                    </div>

                    {selectedOption === 'POLAZNIK' && (
                        <div className={"register-form-element"}>
                            <div>
                                <label htmlFor="email">Email</label><br/>
                                <input type="email" id="email" name="email" required={true}/>
                            </div>
                            <div className="slika-profila">
                                <label htmlFor="image">Slika profila</label>
                                <input type="file" id="image" name="image" accept="image/*"/>
                            </div>
                        </div>
                    )}

                    {selectedOption === 'VLASNIK' && (
                        <div className={"register-form-element"}>
                            <div>
                                <label htmlFor={"naziv_tvrtke"}>Naziv tvrtke</label><br/>
                                <input type="text" id={"naziv_tvrtke"} name={"naziv_tvrtke"} required={true} />
                            </div>

                            <div className="slika-profila">
                                <label htmlFor="image">Logo tvrtke</label>
                                <input type="file" id="image" name="image" accept="image/*"/>
                            </div>

                            <div className={"register-form-owner-address"}>
                                <div>
                                    <label htmlFor={"adresa"}>Adresa tvrtke</label><br/>
                                    <input type="text" id={"adresa"} name={"adresa"} required={true}/>
                                </div>
                                <div>
                                    <label htmlFor={"grad"}>Grad</label><br/>
                                    <input type="text" id={"grad"} name={"grad"} required={true}/>
                                </div>
                            </div>

                            <div>
                                <label htmlFor={"telefon"}>Telefonski broj tvrtke </label><br/>
                                <input type="text" id={"telefon"} name={"telefon"} required={true}/>
                            </div>
                        </div>
                    )}

                    <button type={"submit"}>
                        <img src={githubLogo} alt="github logo"/>
                        <p>REGISTRIRAJ SE!</p>
                    </button>
                </form>
            </div>
        </div>
    );

    let body;
    if ("korisnik registriran") {
        body = profileRegisterBody;
    } else {
        body = profileLoginBody;
    }
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
