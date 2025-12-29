import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageTemplate from "./PageTemplate";
import profilna from '../assets/images/404.png';
import logoutImg from '../assets/icons/logout.svg';
import edit from '../assets/icons/edit-profile.png';
import {SyncLoader} from "react-spinners";
import {useAuth} from "../context/AuthContext";

function ProfilePage() {
    const name = "profile";
    
    const navigate = useNavigate();
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login", { replace: true });
        }
    }, [user, loading, navigate]);

    let body;
    if (user && !loading) {
        let user_data;
        if (user["uloga"] === "ADMIN") {
            user_data = <div></div>;
        } else if (user["uloga"] === "POLAZNIK") {
            user_data =
                <div>
                    <h4>Email: {user["email"]}</h4>
                </div>;
        } else if (user["uloga"] === "VLASNIK") {
            user_data =
                <div>
                    <h4>Naziv tvrtke: {user["naziv_tvrtke"]}</h4>
                    <h4>Adresa: {user["adresa"]}</h4>
                    <h4>Grad: {user["grad"]}</h4>
                    <h4>Telefon: {user["telefon"]}</h4>
                </div>;
        }

        body =
            <div className={"profile-page"}>
                <div className={"profile-page-circle"}>
                    <div></div>
                </div>
                <h1>Moj profil</h1>
                <div className={"profile-page-content"}>

                    <a className="logout" onClick={logout}>
                        <img src={logoutImg} alt={"logout icon"}></img>
                    </a>
                    <div className="user-data">
                        <img
                            //Dodao Filip: Ucitanje slike ako postoji
                            src={user["profImgUrl"] || user["logoImgUrl"] || profilna}
                            alt="Profilna slika"
                            onError={(e) => {
                                e.target.src = profilna
                            }}
                        />
                        <div className="ime-mail">
                            <div className="ime-uredi">
                                <h3>{user["username"]}</h3>
                                <img src={edit} alt={"edit"}></img>
                            </div>
                            <h4>TIP: {user["uloga"]}</h4>
                            {user_data}
                        </div>
                    </div>
                </div>
            </div>;
    } else {
        body =
            <div className="profile-page-loading">
                <SyncLoader className={"profile-page-loader"}/>
            </div>;
    }

    return <PageTemplate name={name} body={body} />;
}

export default ProfilePage;
