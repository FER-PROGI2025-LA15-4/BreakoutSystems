import React, {useEffect, useRef, useState} from "react";
import PageTemplate from "./PageTemplate";
import {useParams} from "react-router";
import {NotFoundContent} from "./NotFound";
import LoadingScreen from "../components/LoadingScreen";
import horor_img1 from "../assets/images/horror-background.png";
import sf_img1 from "../assets/images/sf-background.jpg";
import povijest_img1 from "../assets/images/history-background.png";
import fantasy_img1 from "../assets/images/fantasy-background.png";
import krimi_img1 from "../assets/images/crime-background.png";
import obitelj_img1 from "../assets/images/family-background.png";
import ostalo_img1 from "../assets/images/other-background.png";
import sortArr from "../utils/sortArray";
import ImageGallery from "react-image-gallery";
import {MapContainer, Marker, TileLayer} from "react-leaflet";
import {Rating} from "react-simple-star-rating";
import diamond_img from "../assets/icons/diamond.svg";
import {authFetch, useAuth} from "../context/AuthContext";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import Button1 from "../components/Button1";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import hrLocale from "@fullcalendar/core/locales/hr";


async function fetchRoom(room_id) {
    const response = await fetch(`/api/rooms/${room_id}`);
    if (response.ok) {
        return await response.json();
    } else {
        return null;
    }
}
async function fetchOwner(room_id) {
    const response = await fetch(`/api/rooms/${room_id}/owner`);
    if (response.ok) {
        return await response.json();
    } else {
        return null;
    }
}
async function fetchLeaderboard(room_id) {
    const response = await fetch(`/api/leaderboard?room_id=${room_id}&limit=10`);
    if (response.ok) {
        let data = await response.json();
        data = sortArr(data, (entry) => entry.score, "asc");
        return data;
    } else {
        return null;
    }
}
async function fetchTeams() {
    const response = await authFetch("/api/my-teams");
    if (response.ok) {
        const data = await response.json();
        return data["teams"];
    } else {
        return [];
    }
}

// novi api za dohvat dostupnih termina za odredenu sobu?
async function fetchAvailableAppointments(room_id) {
    const response = await fetch(`/api/rooms/${room_id}/appointments`);
    if (response.ok) {
        const data = await response.json();
        return data["appointments"] || data["termini"] || [];
    } else {
        return [];
    }
}
function normalizeAppointmentStart(appointment) {
    if (!appointment) return null;
    const raw = appointment.datVrPoc || appointment.start;
    if (!raw) return null;
    if (raw instanceof Date) return raw;
    if (typeof raw === "string") {
        if (raw.includes("T")) return raw;
        return raw.replace(" ", "T");
    }
    return null;
}
function formatAppointmentLabel(date) {
    if (!date) {
        return "Odaberite termin u kalendaru.";
    }
    const parsed = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsed.getTime())) {
        return "Odabrani termin";
    }
    return new Intl.DateTimeFormat("hr-HR", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(parsed);
}
function toBackendDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return null;
    }
    const pad = (value) => value.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// probni termin samo da se prikaze kalendar, izbrisati kasnije
function getFallbackAppointment() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(18, 0, 0, 0);
    return {
        id: "demo-appointment",
        title: "Probni termin",
        start: date
    };
}


function RoomContent({ room }) {
    const { user } = useAuth();
    const animatedComponents = makeAnimated();
    const calendarRef = useRef(null);
    const [owner, setOwner] = useState(null);
    const [teams, setTeams] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [appointments, setAppointments] = useState(null);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [reservationNote, setReservationNote] = useState(null);
    const [currentView, setCurrentView] = useState("dayGridMonth");
    useEffect(() => {
        fetchOwner(room.room_id).then(response => {
            console.log(response);
            setOwner(response);
        })
    }, [room]);
    useEffect(() => {
        if (user && user.uloga === "POLAZNIK") {
            fetchTeams().then((newTeams) => {
                setTeams(newTeams);
            });
        } else {
            setTeams(null);
            setSelectedTeam(null);
        }
    }, [user]);
    useEffect(() => {
        let active = true;
        setAppointmentsLoading(true);
        fetchAvailableAppointments(room.room_id)
            .then((data) => {
                if (!active) return;
                setAppointments(data);
                setSelectedAppointment(null);
            })
            .catch(() => {
                if (!active) return;
                setAppointments([]);
            })
            .finally(() => {
                if (!active) return;
                setAppointmentsLoading(false);
            });
        return () => {
            active = false;
        };
    }, [room]);

    // const [leaderboard, setLeaderboard] = useState(null);
    // useEffect(() => {
    //     fetchLeaderboard(room.room_id).then(data => {
    //         setLeaderboard(data);
    //     });
    // }, [room]);
    const leaderboard = [
        { team: "tim1", score: 350 },
        { team: "tim2", score: 300 },
        { team: "tim3", score: 400 },
        { team: "tim4", score: 450 },
        { team: "tim5", score: 500 },
        { team: "tim6", score: 550 },
        { team: "tim7", score: 600 },
        { team: "tim8", score: 650 },
        { team: "tim9", score: 3695 },
        { team: "tim10", score: 750 },
    ];

    let img1;
    switch (room.kategorija) {
        case "Horor":
            img1 = horor_img1;
            break;
        case "SF":
            img1 = sf_img1;
            break;
        case "Povijest":
            img1 = povijest_img1;
            break;
        case "Fantasy":
            img1 = fantasy_img1;
            break;
        case "Krimi":
            img1 = krimi_img1;
            break;
        case "Obitelj":
            img1 = obitelj_img1;
            break;
        default:
            img1 = ostalo_img1;
            break;
    }

    const handleTeamSelect = (opt) => {
        setSelectedTeam(opt ? opt.team : null);
        setReservationNote(null);
    };
    const handleEventClick = (info) => {
        setSelectedAppointment({
            id: info.event.id,
            start: info.event.start,
            startStr: info.event.startStr,
            raw: info.event.extendedProps.raw
        });
        setReservationNote(null);
    };
    const sourceAppointments = appointments && appointments.length > 0 ? appointments : [getFallbackAppointment()];
    const calendarEvents = (sourceAppointments || [])
        .map((appointment) => {
            const start = normalizeAppointmentStart(appointment);
            if (!start) return null;
            const eventId = appointment.id || appointment.datVrPoc || (start instanceof Date ? start.toISOString() : start);
            return {
                id: eventId,
                title: room.naziv,
                start: start,
                extendedProps: { raw: appointment }
            };
        })
        .filter(Boolean);
    const reservationDisabled = !selectedTeam || !selectedAppointment;
    const selectedLabel = formatAppointmentLabel(selectedAppointment?.start || selectedAppointment?.startStr);
    const handleReserveClick = () => {
        if (reservationDisabled) {
            setReservationNote("Odaberite tim i termin.");
            return;
        }
        const payload = {
            room_id: room.room_id,
            ime_tima: selectedTeam.name,
            datVrPoc: selectedAppointment?.raw?.datVrPoc || toBackendDate(selectedAppointment.start)
        };
        console.log("Podaci rezervacije", payload);
        setReservationNote("Rezervacija je spremna za slanje.");
    };

    return (
        <div className={"room-page"}>
            <section className={"room-page-section-title"}>
                <img src={img1} alt="background image" />
                <p>{room.kategorija}</p>
                <h1>{room.naziv}</h1>
            </section>
            <section className={"room-page-section-content"}>
                <div className={"room-page-section-content-info"}>
                    <p className="opis">
                        {room.opis}
                    </p>

                    <div className={"room-page-gallery"}>
                        <ImageGallery lazyLoad={true} items={room.slike.map((img) => ({ original: img, thumbnail: img, loading: "lazy", thumbnailLoading: "lazy" }))}/>
                    </div>

                    <p>
                        <strong>Težina: </strong>
                        <Rating size={30} readonly={true} allowFraction={true} initialValue={room.tezina}/>
                    </p>

                    <p>
                        <strong>Veličina tima: </strong>
                        {room.minBrClanTima} - {room.maxBrClanTima} članova
                    </p>

                    <p>
                        <strong>Cijena: </strong>
                        {room.cijena} €
                    </p>

                    <p>
                        <strong>Lokacija: </strong>
                        {room.adresa}, {room.grad}
                    </p>

                    <MapContainer className={"room-page-map"} center={[room.geo_lat, room.geo_long]} zoom={10} scrollWheelZoom={false} attributionControl={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                        <Marker position={[room.geo_lat, room.geo_long]}/>
                    </MapContainer>
                </div>
                <div className={"room-page-section-content-side"}>
                    <div className="upute">
                        <h4>Kako rezervirati?</h4>
                        <p>Registrirajte se, osnujte svoj tim i rezervirajte neki od slobodnih termina.</p>
                    </div>
                    {owner &&
                        <div className={"room-page-owner"}>
                            {owner.logoImgUrl && <img src={owner.logoImgUrl} alt="owner logo" />}
                            <div>
                                <h4>{owner.naziv_tvrtke}</h4>
                                <p>{owner.adresa}, {owner.grad}</p>
                                <p>Tel: {owner.telefon}</p>
                            </div>
                        </div>
                    }
                    {leaderboard && leaderboard.length > 0 && (
                        <div className={"room-page-leaderboard"}>
                            <h4>Leaderboard</h4>
                            <ol>
                                {leaderboard.map((entry, index) => (
                                    <li key={index}>
                                        <img src={diamond_img} alt="diamond icon" />
                                        <p className={"room-page-leaderboard-team"}>{entry.team}</p>
                                        <p>{Math.floor(entry.score / 3600).toString(10).padStart(2, '0')}:{(Math.floor(entry.score / 60) % 60).toString(10).padStart(2, '0')}:{(entry.score % 60).toString(10).padStart(2, '0')}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>
            </section>
            <section className={"room-page-section-reservation"}>
                <img src={img1} alt="background image" />
                <h4>Rezervirajte termin</h4>
                <div className={"room-page-reservation-content"}>
                    <div className={"room-page-reservation-panel"}>
                        <div className={"room-page-reservation-field"}>
                            <label>Odaberite tim</label>
                            {user && user.uloga === "POLAZNIK" ? (
                                <Select
                                    components={animatedComponents}
                                    options={teams ? teams.map((team) => ({ value: team.name, label: team.name, team: team })) : []}
                                    isLoading={teams === null}
                                    isMulti={false}
                                    isClearable={true}
                                    placeholder="Tim"
                                    onChange={handleTeamSelect}
                                    className="room-page-reservation-select"
                                />
                            ) : (
                                <p className={"room-page-reservation-hint"}>Prijavite se da biste rezervirali termin.</p>
                            )}
                        </div>
                        <div className={"room-page-reservation-field"}>
                            <label>Odabrani termin</label>
                            <p className={"room-page-reservation-selected"}>{selectedLabel}</p>
                        </div>
                        <Button1
                            text={"REZERVIRAJ"}
                            onClick={handleReserveClick}
                            className={`room-page-reservation-button${reservationDisabled ? " disabled" : ""}`}
                        />
                        {reservationNote && <p className={"room-page-reservation-note"}>{reservationNote}</p>}
                    </div>
                    <div className={"room-page-reservation-calendar"}>
                        {appointmentsLoading ? (
                            <p>Ucitavanje slobodnih termina...</p>
                        ) : calendarEvents.length === 0 ? (
                            <p>Trenutno nema slobodnih termina.</p>
                        ) : (
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: "prev,next today",
                                    center: "title",
                                    right: currentView === "listDay" ? "backToMonth" : ""
                                }}
                                locale={hrLocale}
                                customButtons={{
                                    backToMonth: {
                                        text: "Natrag",
                                        click: () => {
                                            const api = calendarRef.current?.getApi();
                                            if (api) {
                                                api.changeView("dayGridMonth");
                                            }
                                        }
                                    }
                                }}
                                buttonText={{
                                    today: "Danas"
                                }}
                                datesSet={(info) => setCurrentView(info.view.type)}
                                events={calendarEvents}
                                eventClick={handleEventClick}
                                dateClick={(info) => info.view.calendar.changeView("listDay", info.date)}
                                eventContent={(arg) => {
                                    if (arg.view.type === "dayGridMonth") {
                                        return <span className="room-page-calendar-time-only">{arg.timeText}</span>;
                                    }
                                    if (arg.view.type.startsWith("list")) {
                                        return (
                                            <span className="room-page-calendar-list-title">
                                                {arg.timeText} {arg.event.title}
                                            </span>
                                        );
                                    }
                                    return undefined;
                                }}
                                eventClassNames={(arg) =>
                                    arg.event.id === selectedAppointment?.id
                                        ? ["room-page-calendar-event-selected"]
                                        : ["room-page-calendar-event"]
                                }
                                eventDisplay="block"
                                eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                                validRange={{ start: new Date() }}
                                height="auto"
                            />
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

function RoomPage() {
    const { room_id } = useParams();

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        fetchRoom(room_id).then(data => {
            setRoom(data);
            setLoading(false);
        });
    }, []);

    const name = !loading && room === null ? "not-found" : "room";
    let body;
    if (loading) {
        body = <LoadingScreen />;
    } else {
        if (room === null) {
            body = <NotFoundContent/>;
        } else {
            body = <RoomContent room={room}/>;
        }
    }
    return <PageTemplate name={name} body={body}/>;
}

export default RoomPage;
