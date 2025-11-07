import React from "react";
import RightArrowIcon from "../assets/icons/right-arrow.svg";
import { NavLink } from "react-router-dom";

function PageNavLink1(props) {
    let class_name = "page-nav-link-1";
    if (props.className) {
        class_name += " " + props.className;
    }
    return (
        <NavLink to={props.to} className={class_name}>
            <p>{props.text}</p>
            <img src={RightArrowIcon} alt="Desna strelica"/>
        </NavLink>
    );
}

export default PageNavLink1;
