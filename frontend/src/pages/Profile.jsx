import React from "react";
import PageTemplate from "./PageTemplate";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import profilna from '../assets/images/404.png';
import logout from '../assets/icons/logout.svg';
import edit from '../assets/icons/edit-profile.png';

function ProfilePage() {
    const name = "profile";

    const body = <div className="profile-page">
        <div className={"profile-page-circle"}></div>
        <h1>Moj profil</h1>
        <div className={"profile-page-content"}>
            <div className="logout">
                <img src={logout}></img>
            </div>
            <div className="user-data">
                <img src={profilna}></img>
                <div className="ime-mail">
                    <div className="ime-uredi">
                        <h3>markohorvat123</h3>
                        <img src={edit}></img>
                    </div>
                    <h4>marko.horvat@gmail.com</h4>
                </div>
            </div>
            <div className="tab-container">
                <Tabs>
                    <Tab>Tab 1</Tab>
                    <Tab>Tab 2</Tab>
                </Tabs>
            </div>
        </div>
    </div>;

    return <PageTemplate name={name} body={body} />;
}

export default ProfilePage;
