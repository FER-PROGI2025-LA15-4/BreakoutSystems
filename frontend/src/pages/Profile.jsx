import React from "react";
import PageTemplate from "./PageTemplate";

function ProfilePage() {
    const name = "profile";
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
    return <PageTemplate name={name} body={body} />;
}

export default ProfilePage;
