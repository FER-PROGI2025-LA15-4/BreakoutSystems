import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router";
import PageTemplate from "./PageTemplate";
import profilna from '../assets/images/404.png';
import logoutImg from '../assets/icons/logout.svg';
import {authFetch, useAuth} from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import sortArr from "../utils/sortArray";


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
                        className="profile-page-user-info-logo-circle"
                    />
                    <div className="profile-page-user-info-text">
                        <h3>{user["username"]}</h3>
                        {user.uloga === "POLAZNIK" && <h4>{user["email"]}</h4>}
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
    const { user, refresh } = useAuth();

    if (!user) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        try {
            await authFetch('/api/auth/edit', {
                method: 'POST',
                body: formData
            });
        } catch (e) {

        } finally {
            refresh();
        }
    }

    let content;
    if (user.uloga === "ADMIN") {
        return null;
    } else if (user.uloga === "VLASNIK") {
        content = <div className={"profile-page-personal-info-tab"}>
            <p>Korisničko ime: {user.username}</p>
            <p>Uloga: {user.uloga}</p>

            <form onSubmit={handleSubmit} encType={"multipart/form-data"}>
                <div>
                    <label htmlFor={"naziv_tvrtke"}>Naziv tvrtke:</label>
                    <input type="text" id={"naziv_tvrtke"} name={"naziv_tvrtke"} defaultValue={user.naziv_tvrtke} required={true} />
                </div>

                <div className={"register-form-owner-address"}>
                    <div>
                        <label htmlFor={"adresa"}>Adresa tvrtke:</label>
                        <input type="text" id={"adresa"} name={"adresa"} defaultValue={user.adresa} required={true}/>
                    </div>
                    <div>
                        <label htmlFor={"grad"}>Grad:</label>
                        <input type="text" id={"grad"} name={"grad"} defaultValue={user.grad} required={true}/>
                    </div>
                </div>

                <div>
                    <label htmlFor={"telefon"}>Telefonski broj tvrtke:</label>
                    <input type="text" id={"telefon"} name={"telefon"} defaultValue={user.telefon} pattern={"(\\+[1-9][0-9]{0,2}|00[1-9][0-9]{0,2}|0)[1-9][0-9]{7,14}"} required={true}/>
                </div>

                <div className="slika-profila">
                    <label htmlFor="image">Promjena logotipa tvrtke:</label>
                    <input type="file" id="image" name="image" accept="image/*"/>
                </div>
                <input type="submit" value={"Spremi promjene"}/>
            </form>
        </div>;
    } else {
        content = <div className={"profile-page-personal-info-tab"}>
            <p>Korisničko ime: {user.username}</p>
            <p>Uloga: {user.uloga}</p>

            <form onSubmit={handleSubmit} encType={"multipart/form-data"}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" defaultValue={user.email} required={true}/>
                </div>
                <div className="slika-profila">
                    <label htmlFor="image">Promjena profilne slike:</label>
                    <input type="file" id="image" name="image" accept="image/*"/>
                </div>
                <input type="submit" value={"Spremi promjene"}/>
            </form>
        </div>;
    }

    return content;
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
    const animatedComponents = makeAnimated();

    if (!user || user.uloga !== "VLASNIK") {
        return null;
    }

    const [myRooms, setMyRooms] = useState(null);
    useEffect(() => {
        fetchMyRooms().then((response) => {
            setMyRooms(response);
        })
    }, [user]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const handleRoomSelect = (opt) => {
        setSelectedRoom(opt ? opt.value : null);
    }

    const [appointments, setAppointments] = useState(null);
    useEffect(() => {
        if (selectedRoom) {
            fetchRoomAppointments(selectedRoom.id).then((response) => {
                setAppointments(sortArr(response.filter((app) => new Date(app.datVrPoc) <= new Date() && app.rezultatSekunde === null && app.ime_tima !== null)));
            });
        } else {
            setAppointments(null);
        }
    }, [selectedRoom]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const handleTerminSelect = (opt) => {
        setSelectedAppointment(opt ? opt.value : null);
    }

    return <div className={"profile-page-result-entry-tab"}>
        <Select
            components={animatedComponents}
            value={selectedRoom ? ({ value: selectedRoom, label: selectedRoom.naziv }) : null}
            options={myRooms ? myRooms.map((room) => ({ value: room, label: room.naziv })) : []}
            isLoading={myRooms === null}
            isMulti={false}
            isClearable={true}
            isDisabled={true}
            placeholder="Escape Room"
            onChange={handleRoomSelect}
            className="profile-page-result-entry-tab-select-room"
        />
        <Select
            components={animatedComponents}
            value={selectedAppointment ? ({ value: selectedAppointment, label: selectedAppointment.datVrPoc }) : null}
            options={appointments ? appointments.map((app) => ({ value: app, label: app.datVrPoc })) : []}
            isLoading={myRooms === null}
            isMulti={false}
            isClearable={true}
            isDisabled={true}
            placeholder="Termin"
            onChange={handleTerminSelect}
            className="profile-page-result-entry-tab-select-termin"
        />
    </div>;
}
function SubscriptionTab() {
    const { user } = useAuth();

    if (!user || user.uloga !== "VLASNIK") {
        return null;
    }

    return <div className={"profile-page-subscription-tab"}>
        <p>Status vaše pretplate: {user.clanarinaDoDatVr}</p>
    </div>;
}


async function fetchMyRooms() {
    const response = await authFetch("/api/my-rooms")
    if (response.ok) {
        const data = await response.json();
        return data["rooms"];
    } else {
        return [];
    }
}
async function fetchRoomAppointments(roomId) {
    const response = await fetch(`/api/appointments?roomId=${roomId}`)
    if (response.ok) {
        const data = await response.json();
        return data["appointments"];
    } else {
        return [];
    }
}