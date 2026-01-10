import {Rating} from "react-simple-star-rating";
import {Popup} from "react-leaflet";
import React from "react";
import {useNavigate} from "react-router";

export default function RoomMapPopup({ room }) {
    const navigate = useNavigate();

    // room: {room_id, naziv, opis, geo_lat, geo_long, adresa, grad, tezina, cijena, minBrClanTima, maxBrClanTima, kategorija, slike}
    return <Popup>
        <div className={"room-map-popup"} onClick={() => navigate(`/escape-rooms/${room.room_id}`)}>
            <h2>{room.naziv}</h2>
            <div><img src={room.slike[0]} alt={"slika sobe"}/></div>
            <h5><strong>Žanr: </strong>{room.kategorija}</h5>
            <h5>
                <strong>Težina: </strong>
                <Rating size={15} readonly={true} allowFraction={true} initialValue={room.tezina}/>
            </h5>
            <h5>
                <strong>Veličina tima: </strong>
                {room.minBrClanTima} - {room.maxBrClanTima} članova
            </h5>
            <h5><strong>Cijena: </strong>{room.cijena} €</h5>
        </div>
    </Popup>;
}
