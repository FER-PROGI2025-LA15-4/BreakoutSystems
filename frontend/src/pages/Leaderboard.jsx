import React from "react";
import PageTemplate from "./PageTemplate";

function LeaderboardPage() {
    const name = "leaderboard";
    const body = <p>Hello leaderboard</p>;
    return <PageTemplate name={name} body={body}/>;
}

export default LeaderboardPage;
