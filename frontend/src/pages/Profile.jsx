import React from "react";
import PageTemplate from "./PageTemplate";

function ProfilePage() {
    const name = "profile";

    const body = <p>profile</p>;
    return <PageTemplate name={name} body={body} />;
}

export default ProfilePage;
