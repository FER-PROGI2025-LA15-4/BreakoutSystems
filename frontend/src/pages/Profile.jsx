import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router";
import PageTemplate from "./PageTemplate";
import profilna from '../assets/images/404.png';
import logoutImg from '../assets/icons/logout.svg';
import {useAuth} from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";


export default function ProfilePage() {
    const name = "profile";
    
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login", { replace: true });
        }
    }, [user, loading, navigate]);

    let body;
    if (user && !loading) {
        body = <ProfilePageContent/>;
    } else {
        body = <LoadingScreen/>;
    }

    return <PageTemplate name={name} body={body} />;
}

function ProfilePageContent() {
    const { user, logout } = useAuth();
    if (!user) return null;

    let tabs = [];
    if (user.uloga === "ADMIN") {
        tabs.push({ name: "Osobni podaci", component: <PersonalInfoTab/> });

    } else if (user.uloga === "VLASNIK") {
        tabs.push({ name: "Osobni podaci", component: <PersonalInfoTab/> });
        tabs.push({ name: "Moje sobe", component: <MyRoomsTab/> });
        tabs.push({ name: "Unos rezultata", component: <ResultEntryTab/> });
        tabs.push({ name: "Pretplata", component: <SubscriptionTab/> });
    } else {  // uloga POLAZNIK
        tabs.push({ name: "Osobni podaci", component: <PersonalInfoTab/> });
        tabs.push({ name: "Moji timovi", component: <MyTeamsTab/> });
        tabs.push({ name: "Povijest igara", component: <GameHistoryTab/> });
    }
    const [currentTab, setCurrentTab] = useState(0);
    const handleTabClick = (tabInd) => {
        if (tabInd !== currentTab) {
            setCurrentTab(tabInd);
        }
    };

    return (
        <div className={"profile-page"}>
            <div className={"profile-page-circle"}><div></div></div>
            <h1>Moj profil</h1>
            <div className={"profile-page-content"}>
                <div className="profile-page-user-info">
                    <img
                        src={user["profImgUrl"] || user["logoImgUrl"] || profilna}
                        alt="profilna slika"
                        className={user.uloga === "VLASNIK" ? "profile-page-user-info-logo-square" : "profile-page-user-info-logo-circle"}
                    />
                    <div className="profile-page-user-info-text">
                        <h3>{user["username"]}</h3>
                        <h4>{user["email"]}</h4>
                        <h4>{user["uloga"]}</h4>
                    </div>
                    <img src={logoutImg} alt={"logout icon"} onClick={logout} className={"profile-page-logout"} />
                </div>
                <div className={"profile-page-tabs"}>
                    {tabs.map((tab, index) => {
                        return <div
                            className={currentTab === index ? "active-tab" : "inactive-tab"}
                            key={index}
                            onClick={() => handleTabClick(index)}
                        >{tab.name}</div>;
                    })}
                </div>
                <div className={"profile-page-tab"}>{tabs[currentTab].component}</div>
            </div>
        </div>
    );
}

function PersonalInfoTab() {
    const { user } = useAuth();

    return <p>personal</p>;
}
function MyTeamsTab() {
    const { user } = useAuth();

    return <p>teams</p>;
}
function GameHistoryTab() {
    const { user } = useAuth();

    return <p>history</p>;
}
function MyRoomsTab() {
    const { user } = useAuth();

    return <p>rooms</p>;
}
function ResultEntryTab() {
    const { user } = useAuth();

    return <p>results</p>;
}
function SubscriptionTab() {
    const { user } = useAuth();

    return <p>subscription</p>;
}
