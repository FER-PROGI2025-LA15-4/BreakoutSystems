import React, {useEffect, useState} from "react";
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


function RoomContent({ room }) {
    // const [owner, setOwner] = useState(null);
    // useEffect(() => {
    //     fetchOwner(room.room_id).then(response => {
    //         setOwner(response);
    //     })
    // }, [room]);
    const owner = {
        naziv_tvrtke: "Escape Room Zagreb",
        adresa: "Ilica 10",
        grad: "Zagreb",
        telefon: "+385 1 234 5678",
        logoImgURL: "https://picsum.photos/200/200",
    };

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


    return (
        <div className={"room-page"}>
            <section className={"room-page-section-title"}>
                <img src={img1} alt="background image" />
                <p>{room.kategorija}</p>
                <h1>{room.naziv}</h1>
            </section>
            <section className={"room-page-section-content"}>
                <div className={"room-page-section-content-info"}>
                    <div className={"room-page-gallery"}>
                        <ImageGallery lazyLoad={true} items={room.slike.map((img) => ({ original: img, thumbnail: img, loading: "lazy", thumbnailLoading: "lazy" }))}/>
                    </div>

                    <p>
                        <strong>Opis:</strong><br/>
                        {room.opis}
                    </p>

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
                    <div>
                        <h4>Kako rezervirati?</h4>
                        <p>Registrirajte se, osnujte svoj tim i rezervirajte neki od slobodnih termina.</p>
                    </div>
                    <div className={"room-page-owner"}>
                        <img src={owner.logoImgURL} alt="owner logo" />
                        <div>
                            <h4>{owner.naziv_tvrtke}</h4>
                            <p>{owner.adresa}, {owner.grad}</p>
                            <p>Tel: {owner.telefon}</p>
                        </div>
                    </div>
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
