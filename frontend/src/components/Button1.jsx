import React from "react";

function Button1({ text, onClick, className, type= undefined }) {
    return <button onClick={onClick} className={"button1 " + className} type={type}>{text}</button>;
}

export default Button1;
