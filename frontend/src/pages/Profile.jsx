import React from "react";
import PageTemplate from "./PageTemplate";

function ProfilePage() {
    const name = "profile";

    const body = <div className="profile-page">
        <div className={"profile-page-circle"}></div>
        <h1>Moj profil</h1>
        <div className={"profile-page-content"}>
            <p>ime korisnika</p>
        </div>
    </div>;

    return <PageTemplate name={name} body={body} />;
}

export default ProfilePage;
