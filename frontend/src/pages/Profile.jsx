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
                navigate('/login');
            });
    }, [navigate]);

    const handleLogout = () => {
        // Redirect na logout endpoint
        window.location.href = '/api/auth/logout';
    };

    let content = <div></div>;
    if (loading) {
        content = <SyncLoader />;
    } else if (userData) {
        content =
        <div className={"profile-page-content"}>
            <div className="logout" onClick={handleLogout}>
                <img src={logout} alt={"logout icon"}></img>
            </div>
            <div className="user-data">
                <img src={profilna}></img>
                <div className="ime-mail">
                    <div className="ime-uredi">
                        <h3>{userData.username}</h3>
                        <img src={edit}></img>
                    </div>
                    <h4>{userData.email}</h4>
                </div>
            </div>
        </div>;
    }

    const body =
        <div className="profile-page">
            <div className={"profile-page-circle"}></div>
            { !loading && userData && <h1>Moj profil</h1> }

            {content}
        </div>;

    return <PageTemplate name={name} body={body} />;
}

export default ProfilePage;