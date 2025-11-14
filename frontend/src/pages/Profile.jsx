import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTemplate from "./PageTemplate";
import profilna from '../assets/images/404.png';
import logout from '../assets/icons/logout.svg';
import edit from '../assets/icons/edit-profile.png';
import {SyncLoader} from "react-spinners";

function ProfilePage() {
    const name = "profile";
    
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Dohvati podatke o korisniku
        fetch('/api/me', {
            credentials: 'include' // Važno za session cookie
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Niste logirani');
                }
                return response.json();
            })
            .then(data => {
                setUserData(data);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                navigate('/login', { replace: true });
            });
    }, [navigate]);

    let body;
    if (userData && !loading) {
        let user_data;
        if (userData["uloga"] === "ADMIN") {
            user_data = <div></div>;
        } else if (userData["uloga"] === "POLAZNIK") {
            user_data =
                <div>
                    <h4>Email: {userData["email"]}</h4>
                </div>;
        } else if (userData["uloga"] === "VLASNIK") {
            user_data =
                <div>
                    <h4>Naziv tvrtke: {userData["naziv_tvrtke"]}</h4>
                    <h4>Adresa: {userData["adresa"]}</h4>
                    <h4>Grad: {userData["grad"]}</h4>
                    <h4>Telefon: {userData["telefon"]}</h4>
                </div>;
        }

        body =
            <div className={"profile-page"}>
                <div className={"profile-page-circle"}>
                    <div></div>
                </div>
                <h1>Moj profil</h1>
                <div className={"profile-page-content"}>

                    <a className="logout" href={"/api/auth/logout"}>
                        <img src={logout} alt={"logout icon"}></img>
                    </a>
                    <div className="user-data">
                        <img src={profilna}></img>
                        <div className="ime-mail">
                            <div className="ime-uredi">
                                <h3>{userData["username"]}</h3>
                                <img src={edit}></img>
                            </div>
                            <h4>TIP: {userData["uloga"]}</h4>
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
