import React from "react";
import PageTemplate from "./PageTemplate";
import RoomTile from "../components/RoomTile";
import {useAuth} from "../context/AuthContext";
import Button1 from "../components/Button1";


function EscapeRoomsContent() {
    const { user } = useAuth();

    return (
        <div className="escape-rooms-page">
            <section className="hero">
                <div className="hero-left">
                    <h1>Istraži, rezerviraj, zaigraj!</h1>
                    <p>
                        Istraži najuzbudljivije Escape Room avanture u svom gradu – okupi tim, rješavaj zagonetke i
                        popni se na vrh ljestvice!
                    </p>
                </div>
            </section>
            <section>
                <h2>Odaberite svoju sljedeću avanturu!</h2>
                <p>
                    Više od 100 Escape roomova iz cijele Hrvatske! Odaberite i rezevirajte.
                </p>
                <form>
                    <select id="form-field-name">
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                    </select>
                    <select id="form-field-name">
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                    </select>
                    {user && <>
                        <select id="form-field-name">
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                        </select>
                        <select id="form-field-name">
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                        </select>
                    </>}
                    <Button1 text={"Pretraži"} type="submit"/>
                </form>
            </section>
        </div>
  );

}
function EscapeRoomsPage() {
  const name = "escape-rooms";
  return <PageTemplate name={name} body={<EscapeRoomsContent />} />;
}

export default EscapeRoomsPage;
