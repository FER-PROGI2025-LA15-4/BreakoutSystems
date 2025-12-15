import React from "react";
import x_icon from "../assets/icons/x.svg";

function Popup({ title, message, onClose }) {
    return (
        <div className={"popup-background"}>
            <div className={"popup-window"}>
                <img src={x_icon} alt={"close"} onClick={onClose}/>
                <h1>{title}</h1>
                <p>{message}</p>
            </div>
        </div>);
}

export default Popup;
