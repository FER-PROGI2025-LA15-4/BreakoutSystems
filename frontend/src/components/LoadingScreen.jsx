import React from "react";
import {SyncLoader} from "react-spinners";

export default function LoadingScreen() {
    return <div className="loading-screen">
        <SyncLoader className={"loading-screen-loader"}/>
    </div>;
}