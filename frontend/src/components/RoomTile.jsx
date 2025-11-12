import React from "react";

function RoomTile({ room, className }) {
    let class_name = "room-tile";
    if (className) {
        class_name += " " + className;
    }
    return (
        <div key={room.id} className={class_name}>
            <img src={room.imageUrl} alt={room.name} />
            <h3>{room.name}</h3>
            <p>{room.description}</p>
            <p>
                <strong>Žanr:</strong> {room.genre}
            </p>
            <p>
                <strong>Težina:</strong>{" "}
                {Array.from({ length: room.difficulty }).map((_, i) => "⭐")}
            </p>
            <p>
                <strong>Lokacija:</strong> {room.location}
            </p>
            <button>DETALJI</button>
        </div>
    );
}

export default RoomTile;
