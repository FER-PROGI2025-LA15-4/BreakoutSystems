import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function PageTemplate(props) {
    return (
        <div className="react-body">
            <Header page={props.name}/>
            <div className="page-body">
                {props.body}
            </div>
            <Footer />
        </div>
    );
}

export default PageTemplate;
