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
import { TimePicker } from '@mantine/dates';
import Popup from "../components/Popup";

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
    const [popup, setPopup] = useState({ isOpen: false, title: "", message: "" });
    const handleClosePopup = () => {
        const localPopup = { ...popup };
        localPopup.isOpen = false;
        setPopup(localPopup);
    }

    if (!user) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        try {
            const response = await authFetch('/api/auth/edit', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                setPopup({ isOpen: true, title: "Uspjeh!", message: "Podaci su uspješno ažurirani." });
            } else {
                setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Pokušajte ponovno kasnije." });
            }
        } catch (e) {
            setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Pokušajte ponovno kasnije." });
        } finally {
            refresh();
        }
    }

    let content;
    if (user.uloga === "ADMIN") {
        return null;
    } else if (user.uloga === "VLASNIK") {
        content = <div className={"profile-page-personal-info-tab"}>
            {popup.isOpen && <Popup title={popup.title} message={popup.message} onClose={handleClosePopup}/>}
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
            {popup.isOpen && <Popup title={popup.title} message={popup.message} onClose={handleClosePopup}/>}
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
    const [popup, setPopup] = useState({ isOpen: false, title: "", message: "" });
    const handleClosePopup = () => {
        const localPopup = { ...popup };
        localPopup.isOpen = false;
        setPopup(localPopup);
    }

    if (!user || user.uloga !== "VLASNIK") {
        return null;
    }

    const [myRooms, setMyRooms] = useState(null);
    useEffect(() => {
        console.log("here");
        fetchMyRooms().then((response) => {
            setMyRooms(response);
            console.log("her2");
        })
    }, [user]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const handleRoomSelect = (opt) => {
        setSelectedRoom(opt ? opt.value : null);
    }

    const [appointments, setAppointments] = useState(null);
    useEffect(() => {
        if (selectedRoom) {
            fetchRoomAppointments(selectedRoom.room_id).then((response) => {
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

    const [teamInfo, setTeamInfo] = useState(null);
    useEffect(() => {
        if (selectedAppointment) {
            fetchTeamInfo(selectedAppointment.ime_tima).then((response) => {
                setTeamInfo(response);
            });
        } else {
            setTeamInfo(null);
        }
    }, [selectedAppointment]);

    const [selectedMembers, setSelectedMembers] = useState(null);
    const handleMembersSelect = (values) => {
        if (!values || values.length === 0) {
            values = null;
        } else {
            values = values.map((v) => v.value);
        }
        setSelectedMembers(values);
    }

    const [teamFinished, setTeamFinished] = useState(false);
    const [timeValue, setTimeValue] = useState('23:59:59');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAppointment) {
            alert("Odaberite termin.");
            return;
        }

        if (!selectedMembers || selectedMembers.length < selectedRoom.minBrClanTima || selectedMembers.length > selectedRoom.maxBrClanTima) {
            setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: `Molimo odaberite između ${selectedRoom.minBrClanTima} i ${selectedRoom.maxBrClanTima} članova tima.` });
        }

        const [hours, minutes, seconds] = timeValue.split(':').map(Number);
        const timeSeconds =  hours * 3600 + minutes * 60 + seconds;

        try {
            authFetch("/api/owner/enter-result", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    appointmentRoomId: selectedAppointment.room_id,
                    appointmentDatVrPoc: selectedAppointment.datVrPoc,
                    teamMembers: selectedMembers,
                    resultSeconds: timeSeconds
                })
            }).then((response) => {
                if (response.ok) {
                    setPopup({ isOpen: true, title: "Uspjeh!", message: "Rezultat je uspješno unesen." });
                    setSelectedRoom(null);
                    setSelectedAppointment(null);
                    setSelectedMembers(null);
                    setTimeValue('23:59:59');
                } else {
                    setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Pokušajte ponovno kasnije." });
                }
            })
        } catch (e) {
            setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Pokušajte ponovno kasnije." });
        }
    }

    return <div className={"profile-page-result-entry-tab"}>
        {popup.isOpen && <Popup title={popup.title} message={popup.message} onClose={handleClosePopup}/>}
        <Select
            components={animatedComponents}
            value={selectedRoom ? ({ value: selectedRoom, label: selectedRoom.naziv }) : null}
            options={myRooms ? myRooms.map((room) => ({ value: room, label: room.naziv })) : []}
            isLoading={myRooms === null}
            isMulti={false}
            isClearable={true}
            placeholder="Escape Room"
            onChange={handleRoomSelect}
            className="profile-page-result-entry-tab-select-room"
        />

        {selectedRoom &&
            <Select
                components={animatedComponents}
                value={selectedAppointment ? ({ value: selectedAppointment, label: selectedAppointment.datVrPoc }) : null}
                options={appointments ? appointments.map((app) => ({ value: app, label: app.datVrPoc })) : []}
                isLoading={appointments === null}
                isMulti={false}
                isClearable={true}
                placeholder="Termin"
                onChange={handleTerminSelect}
                className="profile-page-result-entry-tab-select-termin"
            />
        }
        {selectedAppointment && <>
            <p>Tim: {selectedAppointment.ime_tima}</p>
            <Select
                components={animatedComponents}
                value={selectedMembers ? selectedMembers.map((mem) => ({ value: mem, label: mem })) : null}
                options={teamInfo ? teamInfo.members.concat(teamInfo.leader).map((mem) => ({ value: mem, label: mem })) : []}
                isLoading={teamInfo === null}
                isMulti={true}
                isClearable={true}
                placeholder="Članovi tima"
                onChange={handleMembersSelect}
                className="profile-page-result-entry-tab-select-members"
            />
            <form onSubmit={handleSubmit}>
                <label for="finished">
                    <input type="checkbox" id="finished" onChange={(e) => setTeamFinished(e.target.checked)} />
                    Tim je završio sobu
                </label>
                {teamFinished && (
                    <TimePicker
                        label="Vrijeme rješavanja:"
                        className="timePicker"
                        classNames={{
                            label: "profile-timepicker-label",
                            input: "profile-timepicker-input"
                        }}
                        withSeconds
                        value={timeValue}
                        onChange={setTimeValue}
                    />
                )}
                <input type="submit" value={"Unesi rezultat"} />
            </form>
        </>}
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
async function fetchTeamInfo(ime_tima) {
    const response = await authFetch("/api/owner/team-info?ime_tima=" + encodeURIComponent(ime_tima))
    if (response.ok) {
        return await response.json();
    } else {
        return null;
    }
}
