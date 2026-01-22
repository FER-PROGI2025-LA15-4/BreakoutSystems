import React, {useEffect, useRef, useState} from "react";
import {useNavigate, useSearchParams} from "react-router";
import PageTemplate from "./PageTemplate";
import profilna from '../assets/images/default.png';
import logoutImg from '../assets/icons/logout.svg';
import {authFetch, useAuth} from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import sortArr from "../utils/sortArray";
import { TimePicker, DateTimePicker } from '@mantine/dates';
import Popup from "../components/Popup";
import tick_icon from '../assets/icons/tick-circle.svg';
import plus_icon from '../assets/icons/plus.svg';
import {Rating} from "react-simple-star-rating";
import {MapContainer, Marker, TileLayer} from "react-leaflet";
import '../styles/pages/Profile.scss';
import {SyncLoader} from "react-spinners";
import {fetchRoomsFiltered} from "./EscapeRooms";

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
    const { user, logout, refresh } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    if (!user) return null;

    let tabs = [];
    if (user.uloga === "ADMIN") {
        tabs.push({ name: "Termini", component: <AdminAppointmentsTab/> });
        tabs.push({ name: "Članarine", component: <AdminSubscriptionsTab/> });
        tabs.push({ name: "Sobe", component: <MyRoomsTab/> });
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

    useEffect(() => {
        // callback from stripe after payment
        let payment_status = searchParams.get('payment_status');
        if (payment_status) {
            // remove payment_status from URL after reading it
            searchParams.delete('payment_status');
            setSearchParams(searchParams, { replace: true });
        }
        let sessionId = searchParams.get('session_id');
        if (sessionId) {
            // remove session_id from URL after reading it
            searchParams.delete('session_id');
            setSearchParams(searchParams, { replace: true });
        }
        const asyncFunc = async () => {
            try {
                const response = await fetch('/api/confirm-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId })
                })
                if (response.ok) {
                    setPopup({ isOpen: true, title: "Uspjeh!", message: "Vaša pretplata je uspješno aktivirana." });
                    refresh();
                } else {
                    setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Pokušajte ponovno kasnije." });
                }
            } catch (err) {
                setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Pokušajte ponovno kasnije." });
            }
        };

        if (payment_status && payment_status === "true" && sessionId) {
            asyncFunc();
        } else if (payment_status && payment_status === "false") {
            setPopup({ isOpen: true, title: "Plaćanje nije uspjelo", message: "Vaša pretplata nije aktivirana. Pokušajte ponovno." });
        }
    }, []);

    const [popup, setPopup] = useState({ isOpen: false, title: "", message: "" });
    const handleClosePopup = () => {
        const localPopup = { ...popup };
        localPopup.isOpen = false;
        setPopup(localPopup);
    }

    return (
        <div className={"profile-page"}>
             <div className={"profile-page-circle"}><div></div></div>
            {popup.isOpen && <Popup title={popup.title} message={popup.message} onClose={handleClosePopup} />}
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

                <div className={"owner-address"}>
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
                <div className="mail-polaznik">
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
    if (!user || user.uloga !== "POLAZNIK") {
        return null;
    }
    const [popup, setPopup] = useState({ isOpen: false, title: "", message: "" });
    const handleClosePopup = () => {
        const localPopup = { ...popup };
        localPopup.isOpen = false;
        setPopup(localPopup);
    }

    const [view, setView] = useState("list"); // "list", "new", "details"

    const [myTeams, setMyTeams] = useState(null);
    useEffect(() => {
        fetchMyTeams().then(setMyTeams);
    }, []);

    const [myPendingInvites, setMyPendingInvites] = useState(null);
    useEffect(() => {
        fetchTeamInvites().then(setMyPendingInvites);
    }, []);
    const updateInvite = (team_name, action) => {
        authFetch("/api/update-invite", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ team_name, invite_update: action })
        }).then(response => {
            if (response.ok) {
                fetchMyTeams().then(setMyTeams);
                fetchTeamInvites().then(setMyPendingInvites);
            }
        })
    }
    const handleAcceptClick = (team_name) => {
        updateInvite(team_name, "accept");
    }
    const handleDeclineClick = (team_name) => {
        updateInvite(team_name, "decline");
    }

    const [selectedTeam, setSelectedTeam] = useState(null);
    const handleDetailsClick = (team) => {
        setSelectedTeam(team);
        setView("details");
    }
    const [selectedTeamInvites, setSelectedTeamInvites] = useState([]);
    useEffect(() => {
        setSelectedTeamInvites([]);
        if (user.username === selectedTeam?.leader) {
            authFetch("/api/invites?teamName=" + encodeURIComponent(selectedTeam.name)).then(
                response => {
                    if (response.ok) {
                        response.json().then(data => setSelectedTeamInvites(data["users"]))
                    }
                }
            )
        }
    }, [selectedTeam]);

    const submitNewTeam = (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        authFetch("/api/create-team", {
            method: "POST",
            body: formData
        }).then(response => {
            if (response.ok) {
                fetchMyTeams().then(setMyTeams);
            } else if (response.status === 400) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    response.json().then(data => {
                        if (data["error"] === "Team name already taken!") {
                            const localPopup = { isOpen: true, title: "Oops, došlo je do greške!", message: "Ime tima je zauzeto, molimo odaberite drugo ime." };
                            setPopup(localPopup);
                        }
                    });
                }
            }
        });
        setView("list");
    }
    const submitEditTeam = (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        authFetch("/api/edit-team", {
            method: "POST",
            body: formData
        }).then(response => {
            if (response.ok) {
                fetchMyTeams().then(setMyTeams);
            }
        });
    }
    const submitUserAdd = (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
            team_name: form.name.value,
            user: form.user.value
        };
        authFetch("/api/add-member", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                authFetch("/api/invites?teamName=" + encodeURIComponent(selectedTeam.name)).then(
                    response => response.json().then(data => setSelectedTeamInvites(data["users"]))
                )
            }
        });
    }
    const submitUserRemove = (username) => {
        authFetch("/api/remove-member", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ team_name: selectedTeam.name, user: username })
        }).then(response => {
            if (response.ok) {
                fetchMyTeams().then(setMyTeams);
                authFetch("/api/invites?teamName=" + encodeURIComponent(selectedTeam.name)).then(
                    response => response.json().then(data => setSelectedTeamInvites(data["users"]))
                )
            }
        })
    }

    return <div className={"profile-page-my-teams-tab"}>
        {popup.isOpen && <Popup title={popup.title} message={popup.message} onClose={handleClosePopup} />}
        {view === "list" &&
            <div className={"profile-page-my-teams-tab-list"}>
                <div onClick={() => setView("new")} className={"profile-page-my-teams-tab-new-team"}>
                    <img src={plus_icon} alt={"plus icon"}/>
                    <p>Kreiraj novi tim</p>
                </div>
                {myTeams && myTeams.map((team) => (
                    <div key={team.name} className={"profile-page-my-teams-tab-team-entry"}>
                        <img src={team.logo === null ? profilna : team.logo} alt={"team logo"}/>
                        <p className={"profile-page-my-teams-tab-team-entry-name"}>{team.name}</p>
                        <p className={"profile-page-my-teams-tab-team-entry-details"} onClick={() => handleDetailsClick(team)}>Detalji</p>
                    </div>
                ))}
                {myPendingInvites && myPendingInvites.map((team) =>
                    <div key={team.name} className={"profile-page-my-teams-tab-team-entry-invite"}>
                        <img src={team.logo === null ? profilna : team.logo} alt={"team logo"}/>
                        <p className={"profile-page-my-teams-tab-team-entry-name"}>{team.name}</p>
                        <p className={"profile-page-my-teams-tab-team-entry-details"} onClick={() => handleAcceptClick(team.name)}>Prihvati</p>
                        <p className={"profile-page-my-teams-tab-team-entry-details"} onClick={() => handleDeclineClick(team.name)}>Odbij</p>
                    </div>
                )}
            </div>
        }
        {view === "new" &&
            <div className={"profile-page-my-teams-tab-new-form"}>
                <form onSubmit={submitNewTeam} encType={"multipart/form-data"}>
                    <div className="ime-tima">
                        <label htmlFor={"name"}>Naziv tima:</label>
                        <input type={"text"} name={"name"} required={true}/>
                    </div>
                    <div className="slika-profila">
                        <label htmlFor="image">Logo tima:</label>
                        <input type="file" id="image" name="image" accept="image/*"/>
                    </div>
                    <div className="buttons">
                        <input type={"submit"} value={"Kreiraj tim"}/>
                        <input type={"button"} value={"Natrag"} onClick={() => setView("list")}/>
                    </div>
                </form>
            </div>
        }
        {view === "details" &&
            <div className={"profile-page-my-teams-tab-details"}>
                <div className="details-header">
                    <div className="details-header-title">
                        <p>Naziv tima: {selectedTeam.name}</p>
                        <p>Voditelj tima: {selectedTeam.leader}</p>
                    </div>
                    <img src={selectedTeam.logo === null ? profilna : selectedTeam.logo} alt={"team logo"}/>
                </div>
                {selectedTeam.members?.length > 0 && <>
                    <p>Članovi tima ({selectedTeam.members.length}/10):</p>
                    <ul>
                        {selectedTeam.members.map((member) =>
                            <li key={member}>
                                <p>{member}</p>
                                {user.username === selectedTeam.leader && <button onClick={() => submitUserRemove(member)}>Ukloni</button>}
                            </li>
                        )}
                    </ul>
                </>}
                {(selectedTeamInvites || selectedTeam.members.length < 10) &&
                    (<div className="team-invites">
                        <p className="pozvani-korisnici-naslov">Pozvani korisnici:</p>
                        {selectedTeamInvites &&
                            <ul>
                                {selectedTeamInvites.map((member) =>
                                    <li key={member}>
                                        <p>{member}</p>
                                        <button onClick={() => submitUserRemove(member)}>Ukloni</button>
                                    </li>
                                )}
                            </ul>
                        }
                        {selectedTeam.members.length + selectedTeamInvites.length < 10 &&
                            <form onSubmit={submitUserAdd}>
                                <input type={"hidden"} name={"name"} value={selectedTeam.name} required={true}/>
                                <input className="pozovi" type={"text"} name={"user"} placeholder={"Korisničko ime"} required={true}/>
                                <input className="dodaj-korisnika" type={"submit"} value={"Pozovi"}/>
                            </form>
                        }
                    </div>)
                }
                {user.username !== selectedTeam.leader && <button className="napusti-tim" onClick={() => handleDeclineClick(selectedTeam.name)}>Napusti tim</button>}
                {user.username === selectedTeam.leader && <>
                    <form onSubmit={submitEditTeam} encType={"multipart/form-data"}>
                        <input type={"hidden"} name={"name"} value={selectedTeam.name} required={true}/>
                        <div className="slika-profila">
                            <label htmlFor="image">Promijeni logo:</label>
                            <input type="file" id="image" name="image" accept="image/*" required={true}/>
                        </div>
                        <input type={"submit"} value={"Spremi"}/>
                    </form>
                </>}
                <button className={user.username !== selectedTeam.leader ? "back-button" : "back-button-leader"} onClick={() => setView("list")}>Natrag</button>
            </div>
        }
    </div>;
}
function GameHistoryTab() {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user || user.uloga !== "POLAZNIK") {
        return null;
    }

    const [popup, setPopup] = useState({ isOpen: false, title: "", message: "" });
    const handleClosePopup = () => {
        const localPopup = { ...popup };
        localPopup.isOpen = false;
        setPopup(localPopup);
    }

    const [gameHistory, setGameHistory] = useState(null);
    useEffect(() => {
        fetchGameHistory().then(history => setGameHistory(history));
    }, []);

    const handleRatingClick = (index, rating) => {
        const localGameHistory = [...gameHistory];
        localGameHistory[index].ocjena_tezine = rating;
        setGameHistory(localGameHistory);
        authFetch("api/rate-room ", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                room_id: localGameHistory[index].room_id,
                rating: rating
            })
        }).then(response => {
            if (!response.ok) {
                // revert rating on failure
                const revertGameHistory = [...gameHistory];
                revertGameHistory[index].ocjena_tezine = null;
                setGameHistory(revertGameHistory);
                setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Pokušajte ponovno kasnije." });
            } else {
                setPopup({ isOpen: true, title: "Uspjeh!", message: "Hvala vam na ocjeni težine sobe!" });
            }
        })
    }

    return <div className={"profile-page-game-history-tab"}>
        {popup.isOpen && <Popup title={popup.title} message={popup.message} onClose={handleClosePopup}/>}
        {gameHistory === null ? <SyncLoader/> :
            <table>
                <thead>
                    <tr>
                        <th>Escape Room</th>
                        <th>Termin</th>
                        <th>Tim</th>
                        <th>Ocjena težine</th>
                    </tr>
                </thead>
                <tbody>
                        {gameHistory.map((game, index) => <tr>
                            <td className={"history-room-name"} onClick={() => navigate(`/escape-rooms/${game.room_id}`)}>{game.room_name}</td>
                            <td>{game.termin}</td>
                            <td>{game.ime_tima}</td>
                            <td>
                                <Rating size={30} readonly={!!game.ocjena_tezine} allowFraction={true} initialValue={game.ocjena_tezine ? game.ocjena_tezine : 0} name="rating" onClick={game.ocjena_tezine ? () => {} : (rate, _, e) => e && (handleRatingClick(index, rate))} />
                            </td>
                        </tr>)}
                </tbody>
            </table>
        }
    </div>;
}
function MyRoomsTab() {
    const { user } = useAuth();
    if (!user || (user.uloga !== "VLASNIK" && user.uloga !== "ADMIN")) {
        return null;
    }
    const animatedComponents = makeAnimated();
    const activeSubscription = user.clanarinaDoDatVr && new Date(user.clanarinaDoDatVr) > new Date();
    const [popup, setPopup] = useState({ isOpen: false, title: "", message: "" });
    const handleClosePopup = () => {
        const localPopup = { ...popup };
        localPopup.isOpen = false;
        setPopup(localPopup);
    }

    const [myRooms, setMyRooms] = useState(null);
    const [newRoomMode, setNewRoomMode] = useState(false);
    const [newAppointmentMode, setNewAppointmentMode] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    useEffect(() => {
        fetchMyRooms().then((response) => {
            setMyRooms(response);
        })
    }, [user]);
    const handleRoomClick = (room) => {
        if (user.uloga === "VLASNIK" && !activeSubscription) {
            setPopup({ isOpen: true, title: "Nije moguće urediti sobu", message: "Morate imati aktivnu pretplatu da biste uredili sobu." });
        } else {
            setSelectedRoom(room);
        }
    };
    const handleNewRoomClick = () => {
        if (!activeSubscription) {
            setPopup({ isOpen: true, title: "Nije moguće dodati sobu", message: "Morate imati aktivnu pretplatu da biste dodali novu sobu." });
        } else {
            setNewRoomMode(true);
        }
    }
    const handleNewAppointmentClick = () => {
        if (!activeSubscription) {
            setPopup({ isOpen: true, title: "Nije moguće dodati termin", message: "Morate imati aktivnu pretplatu da biste dodali novi termin." });
        } else {
            setNewAppointmentMode(true);
        }
    }

    const handleSubmit = async (e) => {
        e && e.preventDefault();

        const form = e.target;
        const fd = new FormData();

    // 1. Osnovna polja (pazi na nazive da odgovaraju Pythonu)
    if (form.room_id) {
        fd.append("room_id", form.room_id.value);
    }
    fd.append("naziv", form.naziv.value);
    fd.append("opis", form.opis.value);
    fd.append("minBrClanTima", form.minBrClanTima.value);
    fd.append("maxBrClanTima", form.maxBrClanTima.value);
    fd.append("cijena", form.cijena.value);
    fd.append("adresa", form.adresa.value);
    fd.append("grad", form.grad.value);

    // BACKEND traži 'kat' i 'rating'
    fd.append("kat", category);
    fd.append("rating", rating);

    // 2. Koordinate (latLng state)
    if (latLng) {
        const lat = Array.isArray(latLng) ? latLng[0] : (latLng.lat || 45.0);
        const lng = Array.isArray(latLng) ? latLng[1] : (latLng.lng || 16.5);
        fd.append("geo_lat", lat);
        fd.append("geo_long", lng);
    }

    // 3. Slike (images_list mora imati 'nova' ključ za Python)
    const localImagesJson = images.map((img) => {
        if (img.file) {
            return { nova: true };
        } else {
            // Ako je stara slika, šaljemo src
            return { nova: false, src: img.src || img };
        }
    });
    fd.append("images_list", JSON.stringify(localImagesJson));

    // 4. Slanje datoteka
    images.forEach((img) => {
        if (img.file) {
            fd.append("images", img.file); // Mora biti 'images' (množina)
        }
    });

    try {
        const response = await authFetch("/api/owner/edit-room", {
            method: "POST",
            body: fd,
        });

        if (response.ok) {
            setPopup({ isOpen: true, title: "Uspjeh!", message: "Soba je uspješno spremljena." });
            setNewRoomMode(false);
            setSelectedRoom(null);

            // Osvježi listu (pazi: fetchMyRooms mora biti dostupna u scopeu)
            const updatedRooms = await fetchMyRooms();
            setMyRooms(updatedRooms);
        } else {
            setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Pokušajte ponovno kasnije." });
        }
    } catch (error) {
        console.error("Greška pri slanju:", error);
        setPopup({ isOpen: true, title: "Greška", message: "Veza sa serverom nije uspjela." });
    }
};
    const [category, setCategory] = useState("Ostalo");
    const [rating, setRating] = useState(0.5);
    const [map, setMap] = useState(null);
    const [latLng, setLatLng] = useState(null);
    const [images, setImages] = useState([]);
    useEffect(() => {
        if (map) {
            map.on('click', (e) => {
                setLatLng(e.latlng);
            });
        }
    }, [map]);
    useEffect(() => {
        setImages([]);
        if (selectedRoom && !newRoomMode) {
            setLatLng([selectedRoom.geo_lat, selectedRoom.geo_long]);
            setCategory(selectedRoom.kategorija);
            setRating(selectedRoom.tezina);
        } else {
            setLatLng([45, 16.5]);
            setCategory("Ostalo");
            setRating(0.5);
        }
    }, [selectedRoom, newRoomMode]);

    useEffect(() => {
        console.log(images)
    }, [images]);


    const [dtTime, setDtTime] = useState(new Date());
    const handleAddAppointment = () => {
        if (dtTime < new Date()) {
            setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Termin ne može biti u prošlosti." });
        } else {
            authFetch("/api/owner/add-appointment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    room_id: selectedAppRoom.room_id,
                    dt: dtTime.toISOString()
                })
            }).then((response) => {
                if (response.ok) {
                    setPopup({ isOpen: true, title: "Uspjeh!", message: "Termin je uspješno dodan." });
                    setDtTime(new Date());
                    setNewAppointmentMode(false);
                } else {
                    setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Pokušajte ponovno kasnije." });
                }
            })
        }
    };

    const [selectedAppRoom, setSelectedAppRoom] = useState(null);
    const handleAppRoomSelect = (opt) => {
        if (!activeSubscription) {
            setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Morate imati aktivnu pretplatu da biste dodali termine." });
        } else {
            setSelectedAppRoom(opt ? opt.value : null);
        }
    }


    let body;
    if (newRoomMode) {
        body = <form onSubmit={handleSubmit} className={"profile-page-new-room-form"} encType={"multipart/form-data"}>
            <div className="polje">
                <label htmlFor="naziv">Naziv sobe:</label>
                <input type="text" id="naziv" placeholder="Naziv sobe" name={"naziv"} required={true} />
            </div>
            <div className="polje">
                <label htmlFor="opis">Opis sobe:</label>
                <input type="text" id="opis" placeholder="Opis sobe" name={"opis"} required={true} />
            </div>
            <div className="grouped-polje">
                <div className="polje">
                    <label htmlFor="minBrClanTima">Minimalan broj igrača:</label>
                    <input type="number" id="minBrClanTima" name={"minBrClanTima"} required={true} min={1}/>
                </div>
                <div className="polje">
                    <label htmlFor="maxBrClanTima">Maksimalan broj igrača:</label>
                    <input type="number" id="maxBrClanTima" name={"maxBrClanTima"} required={true} min={1} />
                </div>
            </div>
            <div className="polje">
                <label htmlFor="cijena">Cijena (€):</label>
                <input type="number" id="cijena" placeholder="Cijena (€)" step="0.01" name={"cijena"} required={true} min={0.01}/>
            </div>
            <div className="grouped-polje">
                <div className="polje">
                    <label htmlFor="adresa">Adresa:</label>
                    <input type="text" id="adresa" placeholder="Adresa" name={"adresa"} required={true} />
                </div>
                <div className="polje">
                    <label htmlFor="grad">Grad:</label>
                    <input type="text" id="grad" placeholder="Grad" name={"grad"} required={true} />
                </div>
            </div>
            <div className={"mapa-polje"}>
                <label htmlFor="mapa">Lokacija:</label>
                <MapContainer className={"mapa"} center={[45, 16.5]} zoom={7} scrollWheelZoom={false} attributionControl={false} ref={setMap} name="mapa">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                    {latLng && (<Marker position={latLng}/>)}
                </MapContainer>
            </div>
            <div className="polje">
                <label htmlFor="kat">Kategorija sobe:</label>
                <Select
                    components={animatedComponents}
                    value={({ value: category, label: category })}
                    options={['Horor', 'SF', 'Povijest', 'Fantasy', 'Krimi', 'Obitelj', 'Ostalo'].map(cat => ({ value: cat, label: cat }))}
                    isClearable={false}
                    placeholder="Kategorija"
                    onChange={(opt) => setCategory(opt ? opt.value : "Ostalo")}
                    className="profile-page-result-entry-tab-select-room"
                    name="kat"
                />
            </div>
            <div className="polje">
                <label htmlFor="rating" id="tezina">Težina sobe:</label>
                <Rating size={30} readonly={false} allowFraction={true} initialValue={rating} onClick={(rate) => setRating(rate)} name="rating" />
            </div>
            <ImageEditor initialImages={[]} setImages={setImages}/>
            <div className="buttons">
                <input type="submit" value={"Dodaj sobu"} className="dodaj"/>
                <button type="button" onClick={() => setNewRoomMode(false)}>Natrag</button>
            </div>
        </form>;
    } else if (newAppointmentMode) {
        body = <>
        <div className="new-appointment">
            <div className="appointment-header">
                <p>Novi termin:</p>
                <button className="novi-termin-natrag" type="button" onClick={() => setNewAppointmentMode(false)}>Natrag</button>
            </div>
            <Select
                components={animatedComponents}
                value={selectedAppRoom ? ({ value: selectedAppRoom, label: selectedAppRoom.naziv }) : null}
                options={myRooms ? myRooms.map((room) => ({ value: room, label: room.naziv })) : []}
                isLoading={myRooms === null}
                isMulti={false}
                isClearable={true}
                placeholder="Escape Room"
                onChange={handleAppRoomSelect}
                className="profile-page-result-entry-tab-select-room"
            />
            {selectedAppRoom && <>
                <DateTimePicker value={dtTime} onChange={setDtTime} />
                <button className="dodaj-termin" onClick={handleAddAppointment}>Dodaj termin</button>
            </>}
        </div>
        </>;
    } else if (selectedRoom) {
        body = <form onSubmit={handleSubmit} className={"profile-page-new-room-form"} encType={"multipart/form-data"}>
            <input type={"text"} name={"room_id"} hidden={true} value={selectedRoom.room_id}/>
            <div className="polje">
                <label htmlFor="naziv">Naziv sobe:</label>
                <input type="text" id="naziv" placeholder="Naziv sobe" name={"naziv"} required={true} defaultValue={selectedRoom.naziv}/>
            </div>
            <div className="polje">
                <label htmlFor="opis">Opis sobe:</label>
                <input type="text" id="opis" placeholder="Opis sobe" name={"opis"} required={true} defaultValue={selectedRoom.opis} />
            </div>
            <div className="grouped-polje">
                <div className="polje">
                    <label htmlFor="minBrClanTima">Minimalan broj igrača:</label>
                    <input type="number" id="minBrClanTima" name={"minBrClanTima"} required={true} min={1} defaultValue={selectedRoom.minBrClanTima}/>
                </div>
                <div className="polje">
                    <label htmlFor="maxBrClanTima">Maksimalan broj igrača:</label>
                    <input type="number" id="maxBrClanTima" name={"maxBrClanTima"} required={true} min={1} defaultValue={selectedRoom.maxBrClanTima}/>
                </div>
            </div>
            <div className="polje">
                <label htmlFor="cijena">Cijena (€):</label>
                <input type="number" id="cijena" placeholder="Cijena (€)" step="0.01" name={"cijena"} required={true} min={0.01} defaultValue={selectedRoom.cijena}/>
            </div>
            <div className="grouped-polje">
                <div className="polje">
                    <label htmlFor="adresa">Adresa:</label>
                    <input type="text" id="adresa" placeholder="Adresa" name={"adresa"} required={true} defaultValue={selectedRoom.adresa}/>
                </div>
                <div className="polje">
                    <label htmlFor="grad">Grad:</label>
                    <input type="text" id="grad" placeholder="Grad" name={"grad"} required={true} defaultValue={selectedRoom.grad}/>
                </div>
            </div>
            <div className={"mapa-polje"}>
                <label htmlFor="mapa">Lokacija:</label>
                <MapContainer className={"mapa"} center={[45, 16.5]} zoom={7} scrollWheelZoom={false} attributionControl={false} ref={setMap} name="mapa">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                    {latLng && (<Marker position={latLng}/>)}
                </MapContainer>
            </div>
            <div className="polje">
                <label htmlFor="kat">Kategorija sobe:</label>
                <Select
                    components={animatedComponents}
                    value={({ value: category, label: category })}
                    options={['Horor', 'SF', 'Povijest', 'Fantasy', 'Krimi', 'Obitelj', 'Ostalo'].map(cat => ({ value: cat, label: cat }))}
                    isClearable={false}
                    placeholder="Kategorija"
                    onChange={(opt) => setCategory(opt ? opt.value : "Ostalo")}
                    className="profile-page-result-entry-tab-select-room"
                    name="kat"
                />
            </div>
            <div className="polje">
                <label htmlFor="rating" id="tezina">Težina sobe:</label>
                <Rating size={30} readonly={false} allowFraction={true} initialValue={rating} onClick={(rate) => setRating(rate)} name="rating" />
            </div>
            <ImageEditor initialImages={[...selectedRoom.slike]} setImages={setImages}/>
            <div className="buttons">
                <input type="submit" value={"Spremi"} className="dodaj"/>
                <button type="button" onClick={() => setSelectedRoom(false)}>Natrag</button>
            </div>
        </form>;
    } else {
        body = <>
            {user.uloga === "VLASNIK" &&
                <div className="my-rooms-actions">
                    <div className="new-room" onClick={handleNewRoomClick}>
                        <img src={plus_icon} alt="plus icon" />
                        <p>Dodaj novu sobu</p>
                    </div>
                    <div className="new-room" onClick={handleNewAppointmentClick}>
                        <img src={plus_icon} alt="plus icon" />
                        <p>Dodaj termin</p>
                    </div>
                </div>
            }
            {myRooms && <div className="my-rooms-list">
                {myRooms.map((room) => (
                <div key={room.room_id}>
                    <img src={room.slike[0]} alt={"room img"} />
                    <h3>{room.naziv}</h3>
                    <button onClick={() => handleRoomClick(room)}>DETALJI</button>
                </div>
                ))}
            </div>}
        </>;
    }

    return <div>
        {popup.isOpen && <Popup title={popup.title} message={popup.message} onClose={handleClosePopup}/>}
        {body}
    </div>;
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
    const activeSubscription = user.clanarinaDoDatVr && new Date(user.clanarinaDoDatVr) > new Date();

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
        if (!activeSubscription) {
            setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Morate imati aktivnu pretplatu da biste unijeli rezultate." });
        } else {
            setSelectedRoom(opt ? opt.value : null);
        }
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
            setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: `Molimo odaberite između ${selectedRoom.minBrClanTima} do ${selectedRoom.maxBrClanTima} članova tima.` });
            return;
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
                <label htmlFor="finished">
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

    const activeSubscription = user.clanarinaDoDatVr && new Date(user.clanarinaDoDatVr) > new Date();
    const formattedSubscriptionDate = user.clanarinaDoDatVr
        ? new Intl.DateTimeFormat("hr-HR", {
            year: "numeric",
            month: "long",
            day: "2-digit"
        }).format(new Date(user.clanarinaDoDatVr))
        : null;

    const handlePaymentClick = async (type) => {
    try {
        const response = await fetch('/api/start-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tip_placanja: 'pretplata',
                tip: type                    //mjesečna ili godišnja
            })
        });
        const data = await response.json();
        if (data.url) {
            window.location.href = data.url;
        }
    } catch (err) {
        console.error("Greška:", err);
    }
}
    return <div className={"profile-page-subscription-tab"}>
        <div className={"profile-page-subscription-tab-status"}>
            <p>Status vaše pretplate: { activeSubscription ? `vrijedi do ${formattedSubscriptionDate}` : "nemate aktivnu članarinu" }</p>
            { activeSubscription && <img src={tick_icon} alt={"tick icon"}/> }
        </div>
        <div className={"profile-page-subscription-tab-options"}>
            <div className={"profile-page-subscription-tab-option"}>
                <div className="tip-clanarine">
                    <h4>Mjesečna pretplata</h4>
                </div>
                <p className={"profile-page-subscription-tab-option-price"}>
                    <span className="price-currency">€</span>
                    <span className="price-euros">10</span>
                    <span className="price-cents">99</span>
                </p>
                <p>Aktiviraj platformu na 30 dana i upravljaj terminima, rezervacijama i detaljima svojih Escape Roomova.</p>
                <button onClick={() => handlePaymentClick("mjesečna")}>IDI NA PLAĆANJE</button>
            </div>
            <div className={"profile-page-subscription-tab-option"}>
                <div className="tip-clanarine">
                    <h4>Godišnja pretplata</h4>
                </div>
                <p className={"profile-page-subscription-tab-option-price"}>
                    <s>€131.88</s>
                    <span className="price-currency">€</span>
                    <span className="price-euros">99</span>
                    <span className="price-cents">99</span>
                </p>
                <p>Povoljno aktiviraj platformu na 12 mjeseci i osiguraj vidljivost i upravljanje tijekom cijele godine.</p>
                <button onClick={() => handlePaymentClick("godišnja")}>IDI NA PLAĆANJE</button>
            </div>
        </div>
    </div>;
}
function AdminAppointmentsTab() {
    const animatedComponents = makeAnimated();
    const { user } = useAuth();
    if (!user || user.uloga !== "ADMIN") {
        return null;
    }
    const [popup, setPopup] = useState({ isOpen: false, title: "", message: "" });
    const handleClosePopup = () => {
        const localPopup = { ...popup };
        localPopup.isOpen = false;
        setPopup(localPopup);
    }
    const [rooms, setRooms] = useState(null);
    useEffect(() => {
        fetchRoomsFiltered().then(
            (data) => setRooms(data)
        );
    }, []);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const handleRoomSelect = (opt) => {
        setSelectedRoom(opt ? opt.value : null);
        setSelectedAppointment(null);
    }
    const [appointments, setAppointments] = useState(null);
    useEffect(() => {
        setAppointments(null);
        if (selectedRoom) {
            fetchRoomAppointments(selectedRoom.room_id).then((response) => {
                setAppointments(sortArr(response, (app) => app, "desc"));
            });
        }
    }, [selectedRoom]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const handleTerminSelect = (opt) => {
        setSelectedAppointment(opt ? opt.value : null);
    }
    const [timeValue, setTimeValue] = useState('23:59:59');
    useEffect(() => {
        if (selectedAppointment) {
            const totalSeconds = selectedAppointment.rezultatSekunde || 0;
            const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
            const seconds = String(totalSeconds % 60).padStart(2, '0');
            setTimeValue(`${hours}:${minutes}:${seconds}`);
        }
    }, [selectedAppointment]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const room_id = selectedRoom.room_id;
        const datVrPoc = selectedAppointment.datVrPoc;
        const ime_tima = e.target.ime_tima.value;
        const [hours, minutes, seconds] = timeValue.split(':').map(Number);
        const resultSeconds =  hours * 3600 + minutes * 60 + seconds;

        const fd = {
            room_id: room_id,
            datVrPoc: datVrPoc,
            ime_tima: ime_tima,
            rezultatSekunde: resultSeconds
        };

        try {
            const response = await authFetch("/api/admin/appointment", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fd)
            });

            if (response.ok) {
                setPopup({ isOpen: true, title: "Uspjeh!", message: "Termin je uspješno uređen." });
                setSelectedAppointment(null);
                fetchRoomAppointments(selectedRoom.room_id).then((response) => {
                    setAppointments(sortArr(response, (app) => app, "desc"));
                });
            } else {
                setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Pokušajte ponovno kasnije." });
            }
        } catch (e) {
            setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Pokušajte ponovno kasnije." });
        }
    }

    const handleDelete = async () => {
        const room_id = selectedRoom.room_id;
        const datVrPoc = selectedAppointment.datVrPoc;

        try {
            const response = await authFetch("/api/admin/appointment", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    room_id: room_id,
                    datVrPoc: datVrPoc
                })
            });

            if (response.ok) {
                setPopup({ isOpen: true, title: "Uspjeh!", message: "Termin je uspješno obrisan." });
                setSelectedAppointment(null);
            } else {
                setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Pokušajte ponovno kasnije." });
            }
        } catch (e) {
            setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Pokušajte ponovno kasnije." });
        }
    }

    return <div className={"profile-page-admin-appointments-tab"}>
        {popup.isOpen && <Popup title={popup.title} message={popup.message} onClose={handleClosePopup}/>}
        <Select
            components={animatedComponents}
            value={selectedRoom ? ({ value: selectedRoom, label: selectedRoom.naziv }) : null}
            options={rooms ? rooms.map((room) => ({ value: room, label: room.naziv })) : []}
            isLoading={rooms === null}
            isMulti={false}
            isClearable={true}
            placeholder="Escape Room"
            onChange={handleRoomSelect}
            className="profile-page-result-entry-tab-select-room"
        />
        {appointments && <>
            <Select
                components={animatedComponents}
                value={selectedAppointment ? ({ value: selectedAppointment, label: selectedAppointment.datVrPoc }) : null}
                options={appointments ? appointments.map((app) => ({ value: app, label: app.datVrPoc })) : []}
                isMulti={false}
                isClearable={true}
                placeholder="Termin"
                onChange={handleTerminSelect}
                className="profile-page-result-entry-tab-select-room"
            />
            {selectedAppointment && <>
                <form onSubmit={handleSubmit}>
                    <input className="ime-tima-vlasnik-termin" type={"text"} name={"ime_tima"} required={true} defaultValue={selectedAppointment.ime_tima} disabled={!!selectedAppointment.ime_tima}/>
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
                    <input className="spremi-vlasnik-termin" type={"submit"} value={"Spremi"}/>
                    {!selectedAppointment.ime_tima && <button onClick={handleDelete}>Obriši</button>}
                </form>
            </>}
        </>}
    </div>;
}
function AdminSubscriptionsTab() {
    const { user } = useAuth();
    const animatedComponents = makeAnimated();
    if (!user || user.uloga !== "ADMIN") {
        return null;
    }
    const [popup, setPopup] = useState({ isOpen: false, title: "", message: "" });
    const handleClosePopup = () => {
        const localPopup = { ...popup };
        localPopup.isOpen = false;
        setPopup(localPopup);
    }

    const [users, setUsers] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const handleUserSelect = (opt) => {
        setSelectedUser(opt ? opt.value : null);
    }
    useEffect(() => {
        authFetch("/api/admin/subscription").then(async (response) => {
            if (response.ok) {
                const data = await response.json();
                setUsers(data["users"]);
            }
        });
    }, []);
    const activeSubscription = selectedUser && selectedUser.clanarinaDoDatVr && new Date(selectedUser.clanarinaDoDatVr) > new Date();
    const formattedSubscriptionDate = selectedUser && selectedUser.clanarinaDoDatVr ? new Intl.DateTimeFormat("hr-HR", {
        year: "numeric",
        month: "long",
        day: "2-digit"
    }).format(new Date(selectedUser.clanarinaDoDatVr)) : null;

    const handleSubscriptionExtension = (type) => {
        authFetch("/api/admin/subscription", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: selectedUser.username,
                tip: type                    //mjesečna ili godišnja
            })
        }).then((response) => {
            if (response.ok) {
                setPopup({ isOpen: true, title: "Uspjeh!", message: "Pretplata je uspješno produžena." });
                // refresh user data
                authFetch("/api/admin/subscription").then(async (response) => {
                    if (response.ok) {
                        const data = await response.json();
                        setUsers(data["users"]);
                        const updatedUser = data["users"].find((u) => u.username === selectedUser.username);
                        setSelectedUser(updatedUser);
                    }
                });
            } else {
                setPopup({ isOpen: true, title: "Oops, došlo je do greške!", message: "Pokušajte ponovno kasnije." });
            }
        });
    }

    return <div className={"profile-page-admin-subscriptions-tab"}>
        {popup.isOpen && <Popup title={popup.title} message={popup.message} onClose={handleClosePopup}/>}
        <Select
            components={animatedComponents}
            value={selectedUser ? ({ value: selectedUser, label: selectedUser.username }) : null}
            options={users ? users.map((user) => ({ value: user, label: user.username })) : []}
            isLoading={users === null}
            isMulti={false}
            isClearable={true}
            placeholder="Korisnik"
            onChange={handleUserSelect}
            className="profile-page-result-entry-tab-select-room"
        />
        {selectedUser && <>
            <div className="status-admin-row">
                <p className="status-admin">Status pretplate: { activeSubscription ? `vrijedi do ${formattedSubscriptionDate}` : "članarina nije aktivna" }</p>
                { activeSubscription && <img className="status-admin-icon" src={tick_icon} alt={"tick icon"}/> }
            </div>
            <div className="admin-subscription-buttons">
                <button onClick={() => handleSubscriptionExtension("mjesečna")}>Produži mjesec dana</button>
                <button onClick={() => handleSubscriptionExtension("godišnja")}>Produži godinu dana</button>
            </div>
        </>}
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
export async function fetchRoomAppointments(roomId) {
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
async function fetchGameHistory() {
    const response = await authFetch("/api/game-history")
    if (response.ok) {
        const data = await response.json();
        return sortArr(data["history"], (game) => game.termin, "desc");
    } else {
        return [];
    }
}
async function fetchMyTeams() {
    const response = await authFetch("/api/my-teams")
    if (response.ok) {
        const data = await response.json();
        return data["teams"];
    } else {
        return [];
    }
}
async function fetchTeamInvites() {
    const response = await authFetch("/api/team-invites")
    if (response.ok) {
        const data = await response.json();
        return data["invites"];
    } else {
        return [];
    }
}

function ImageEditor({ initialImages = [], maxFiles = 20, setImages = () => {} }) {
    const fileInputRef = useRef(null);
    const dragIndexRef = useRef(null);

    const normalizeInitial = (imgs) => {
        return (imgs || []).map((img, i) => {
            if (typeof img === "string") {
                return { key: `srv-url-${i}-${String(img).slice(-8)}`, id: null, file: null, src: img, isNew: false };
            }
            const id = img && (img.id ?? img.image_id ?? null);
            const url = img && (img.url ?? img.src ?? img);
            return { key: `srv-${id ?? i}-${Math.random().toString(36).slice(2,8)}`, id: id, file: null, src: url, isNew: false };
        });
    };

    const [items, setItems] = useState(normalizeInitial(initialImages));

    useEffect(() => {
        setImages(items);
    }, [items]);

    useEffect(() => {
        return () => {
            items.forEach((it) => {
                if (it.isNew && it.src && it.src.startsWith("blob:")) URL.revokeObjectURL(it.src);
            });
        };
    }, [items]);

    const addFiles = (fileList) => {
        const files = Array.from(fileList).slice(0, Math.max(0, maxFiles - items.length));
        if (files.length === 0) return;
        const newItems = files.map((file, idx) => {
            const key = `new-${Date.now()}-${Math.random().toString(36).slice(2)}-${idx}`;
            return { key, id: null, file, src: URL.createObjectURL(file), isNew: true };
        });
        setItems((prev) => [...prev, ...newItems]);
    };

    const handleInputChange = (e) => {
        addFiles(e.target.files);
        e.target.value = null;
    };

    const removeAt = (index) => {
        setItems((prev) => {
            const copy = [...prev];
            const [removed] = copy.splice(index, 1);
            if (!removed) return prev;
            if (removed.isNew) {
                if (removed.src && removed.src.startsWith("blob:")) URL.revokeObjectURL(removed.src);
            }
            return copy;
        });
    };

    const moveBy = (index, delta) => {
        setItems((prev) => {
            const nextIndex = index + delta;
            if (nextIndex < 0 || nextIndex >= prev.length) return prev;
            const copy = [...prev];
            const [moved] = copy.splice(index, 1);
            copy.splice(nextIndex, 0, moved);
            return copy;
        });
    };

    // drag-and-drop handlers for reorder
    const onDragStart = (e, index) => {
        dragIndexRef.current = index;
        try {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(index));
            // use the element itself as drag image (best-effort)
            if (e.currentTarget && e.dataTransfer.setDragImage) {
                e.dataTransfer.setDragImage(e.currentTarget, 10, 10);
            }
        } catch (err) {}
    };
    const onDragOver = (e) => {
        e.preventDefault();
        try { e.dataTransfer.dropEffect = "move"; } catch (err) {}
    };
    const onDrop = (e, dropIndex) => {
        e.preventDefault();
        let dragIndex = dragIndexRef.current;
        if (dragIndex === null || dragIndex === undefined) {
            try {
                const d = e.dataTransfer.getData("text/plain");
                if (d) dragIndex = Number(d);
            } catch (err) {}
        }
        if (dragIndex === null || dragIndex === undefined || isNaN(dragIndex)) return;
        if (dragIndex === dropIndex) return;
        setItems((prev) => {
            const copy = [...prev];
            const [moved] = copy.splice(dragIndex, 1);
            copy.splice(dropIndex, 0, moved);
            return copy;
        });
        dragIndexRef.current = null;
    };
    const onDragEnd = () => {
        dragIndexRef.current = null;
    };

    return (
        <div className="image-editor">
            <div className="image-editor-controls">
                <button type="button" onClick={() => fileInputRef.current.click()}>Dodaj slike</button>
                <span className="image-editor-count">{items.length} / {maxFiles}</span>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="image-editor-input"
                    onChange={handleInputChange}
                />
            </div>

            <div className="image-editor-grid">
                {items.map((it, idx) => (
                    <div
                        key={it.key}
                        className="image-editor-thumb"
                        draggable
                        onDragStart={(e) => onDragStart(e, idx)}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, idx)}
                        onDragEnd={onDragEnd}
                        title="Drag to reorder"
                    >
                        <img
                            src={it.src}
                            alt={`preview-${idx}`}
                            className="image-editor-img"
                            draggable={false}
                            onDragStart={(e) => onDragStart(e, idx)}
                            onDragEnd={onDragEnd}
                        />
                        {!it.isNew && it.id !== null && <div className="image-editor-meta">#{it.id}</div>}
                        <button type="button" aria-label="Ukloni sliku" onClick={() => removeAt(idx)} className="image-editor-remove">×</button>
                        <button
                            type="button"
                            aria-label="Pomakni lijevo"
                            onClick={() => moveBy(idx, -1)}
                            className="image-editor-move image-editor-move-left"
                            disabled={idx === 0}
                        >
                            &lt;
                        </button>
                        <button
                            type="button"
                            aria-label="Pomakni desno"
                            onClick={() => moveBy(idx, 1)}
                            className="image-editor-move image-editor-move-right"
                            disabled={idx === items.length - 1}
                        >
                            &gt;
                        </button>
                        <div className="image-editor-order">{idx + 1}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
