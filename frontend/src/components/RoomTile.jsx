import React from "react";
import Button1 from "./Button1";

function RoomTile({ room, className = "" }) {
    // room: {room_id, naziv, opis, geo_lat, geo_long, adresa, grad, tezina, cijena, minBrClanTima, maxBrClanTima, kategorija, slike}
    let class_name = "room-tile";
    if (className) {
        class_name += " " + className;
    }
    return (
        <div key={room.room_id} className={class_name}>
            <img src={room.slike[0]} alt={room.naziv} />
            <h3>{room.naziv}</h3>
            <p>{room.opis}</p>
            <p>
                <strong>Žanr:</strong> {room.kategorija}
            </p>
            <p>
                <strong>Težina:</strong>{" "}
                {Array.from({ length: room.tezina }).map((_, i) => "⭐")}
            </p>
            <p>
                <strong>Grad:</strong> {room.grad}
            </p>
            <Button1 text={"DETALJI"} className={"room-tile-button"}/>
        </div>
    );
}

export default RoomTile;
