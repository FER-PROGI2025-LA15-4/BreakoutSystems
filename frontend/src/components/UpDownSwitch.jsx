import React, {useEffect, useState} from "react";
import up_black from "../assets/icons/arrow-up-black.svg";
import down_black from "../assets/icons/arrow-down-black.svg";
import up_grey from "../assets/icons/arrow-up-grey.svg";
import down_grey from "../assets/icons/arrow-down-grey.svg";


function UpDownSwitch({ className = "", direction = "up", visible = false, onClick = () => {} }) {
    const [imgSrc, setImgSrc] = useState(up_black);
    useEffect(() => {
        let newImgSrc = up_black;
        if (visible) {
            if (direction === "up") {
                newImgSrc = up_black;
            } else if (direction === "down") {
                newImgSrc = down_black;
            }
        } else {
            if (direction === "up") {
                newImgSrc = up_grey;
            } else if (direction === "down") {
                newImgSrc = down_grey;
            }
        }
        setImgSrc(newImgSrc);
    }, [visible, direction]);

    const [hover, setHover] = useState(false);
    const handleMouseEnter = () => setHover(true);
    const handleMouseLeave = () =>  setHover(false);

    const [classStr, setClassStr] = useState("up-down-switch");
    useEffect(() => {
        let newClassStr = "up-down-switch";
        if (!visible && !hover) {
            newClassStr += ` up-down-switch-hidden`;
        }
        newClassStr += " " + className;
        setClassStr(newClassStr);
    }, [visible, hover]);

    return <img
        src={imgSrc}
        alt="up-down switch image"
        className={classStr}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
    />;
}

export default UpDownSwitch;
