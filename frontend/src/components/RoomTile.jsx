import React from "react";
import Button1 from "./Button1";
import {useNavigate} from "react-router";
import {Rating} from "react-simple-star-rating";

function RoomTile({ room, className = "" }) {
    // room: {room_id, naziv, opis, geo_lat, geo_long, adresa, grad, tezina, cijena, minBrClanTima, maxBrClanTima, kategorija, slike}
    let class_name = "room-tile";
    if (className) {
        class_name += " " + className;
    }
    const navigate = useNavigate();
    return (
        <div key={room.room_id} className={class_name}>
            <img src={room.slike[0]} alt={room.naziv} />
            <h3>{room.naziv}</h3>
            <p>{room.opis}</p>
            <p>
                <strong>Žanr:</strong> {room.kategorija}
            </p>
            <p>
                <strong>Težina: </strong>
                <span><Rating size={30} readonly={true} allowFraction={true} initialValue={room.tezina}/></span>
            </p>
            <p>
                <strong>Grad:</strong> {room.grad}
            </p>
            <p>
                <strong>Cijena: </strong>{room.cijena} €
            </p>
            <Button1 text={"DETALJI"} className={"room-tile-button"} onClick={() => navigate(`/escape-rooms/${room.room_id}`)}/>
        </div>
    );
}

export default RoomTile;
