import React from "react";
import RightArrowIcon from "../assets/icons/right-arrow.svg";
import RightArrowIconDark from "../assets/icons/right-arrow-black.svg";
import { NavLink } from "react-router-dom";

function PageNavLink1(props) {
    let class_name = "page-nav-link-1";
    if (props.className) {
        class_name += " " + props.className;
    }
    const right_icon = props.dark === true ? RightArrowIconDark : RightArrowIcon;
    return (
        <NavLink to={props.to} className={class_name}>
            <p>{props.text}</p>
            <img src={right_icon} alt="Desna strelica"/>
        </NavLink>
    );
}

export default PageNavLink1;
