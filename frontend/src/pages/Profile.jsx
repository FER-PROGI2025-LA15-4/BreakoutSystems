import React, {useEffect, useRef, useState} from "react";
import {useNavigate, useSearchParams} from "react-router";
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
import tick_icon from '../assets/icons/tick-circle.svg';
import plus_icon from '../assets/icons/plus.svg';
import {Rating} from "react-simple-star-rating";
import {MapContainer, Marker, TileLayer} from "react-leaflet";
import '../styles/pages/Profile.scss';

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
    const [searchParams, setSearchParams] = useSearchParams();
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

    const [newRoomMode, setNewRoomMode] = useState(false);

    const handleSubmit = async (e) => {
        e && e.preventDefault();
        const fd = new FormData();

        result.items.forEach((it) => {
            if (it.isNew) {
                order.push(`NEW_${newIndex}`);
                newFiles.push(it.file);
                newIndex += 1;
            } else {
                order.push(it.id);
            }
        });

        fd.append("removed_ids", JSON.stringify(removedIds));
        fd.append("order", JSON.stringify(order));
        newFiles.forEach((file) => fd.append(fieldNewFiles, file, file.name));
    };
    const result = { items: [] };
    const [selectedCategory, setSelectedCategory] = useState("Ostalo");
    const [map, setMap] = useState(null);
    const [latLng, setLatLng] = useState([0, 0]);
    useEffect(() => {
        if (map) {
            map.on('click', (e) => {
                setLatLng(e.latlng);
            });
        }
    }, [map]);

    let body;
    if (newRoomMode) {
        body = <form onSubmit={handleSubmit} className={"profile-page-new-room-form"}>
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
            <MapContainer className={"mapa"} center={[45.5, 16.5]} zoom={7} scrollWheelZoom={false} attributionControl={false} ref={setMap}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                <Marker position={latLng}/>
            </MapContainer>
            <div className="polje">
                <label htmlFor="kat">Kategorija sobe:</label>
                <Select
                    components={animatedComponents}
                    value={({ value: selectedCategory, label: selectedCategory })}
                    options={['Horor', 'SF', 'Povijest', 'Fantasy', 'Krimi', 'Obitelj', 'Ostalo'].map(cat => ({ value: cat, label: cat }))}
                    isClearable={false}
                    placeholder="Kategorija"
                    onChange={(opt) => setSelectedCategory(opt ? opt.value : "Ostalo")}
                    className="profile-page-result-entry-tab-select-room"
                    name="kat"
                />
            </div>
            <div className="polje">
                <label htmlFor="rating" id="tezina">Težina sobe:</label>
                <Rating size={30} readonly={false} allowFraction={true} initialValue={0} name="rating" />
            </div>
            <ImageEditor initialImages={myRooms[1].slike} result={result}/>
            <div className="buttons">
                <input type="submit" value={"Dodaj sobu"} className="dodaj"/>
                <button type="button" onClick={() => setNewRoomMode(false)}>Natrag</button>
            </div>
        </form>;
    } else if (selectedRoom) {
        body = <p>room details</p>;
    } else {
        body = <>
            <div className="new-room" onClick={() => setNewRoomMode(true)}>
                <img src={plus_icon} alt="plus icon" />
                <p>Dodaj novu sobu</p>
            </div>
            {myRooms && <div className="my-rooms-list">
                {myRooms.map((room) => (
                <div key={room.room_id} onClick={() => handleRoomSelect(room)}>
                    <img src={room.slike[0]} alt={"room img"} />
                    <h3>{room.naziv}</h3>
                    <button onClick={() => handleRoomSelect(room)}>DETALJI</button>
                </div>
                ))}
            </div>}
        </>;
    }

    return <div>{body}</div>;
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
                body: JSON.stringify({ tip: type })
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

function ImageEditor({ initialImages = [], maxFiles = 20, result = { items: [] } }) {
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

    const [items, setItems] = useState(() => normalizeInitial(initialImages));

    useEffect(() => {
        result.items = items;
    }, [items]);

    useEffect(() => {
        setItems(normalizeInitial(initialImages));
    }, [JSON.stringify(initialImages)]);

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
                        <button type="button" aria-label="Remove image" onClick={() => removeAt(idx)} className="image-editor-remove">×</button>
                        <div className="image-editor-order">{idx + 1}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
