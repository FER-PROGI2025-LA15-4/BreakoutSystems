import React, {useEffect, useState} from "react";
import PageTemplate from "./PageTemplate";
import RoomTile from "../components/RoomTile";
import {useAuth} from "../context/AuthContext";
import Button1 from "../components/Button1";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import {authFetch} from "../context/AuthContext";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import MapController from "../components/MapController";
import calculateMapCenterZoom from "../utils/calculateMapCenterZoom";
import sortArr from "../utils/sortArray";


async function fetchCities() {
    const response = await fetch("/api/cities")
    if (response.ok) {
        const data = await response.json();
        return data["cities"];
    } else {
        return [];
    }
}
async function fetchCategories() {
    const response = await fetch("/api/categories")
    if (response.ok) {
        const data = await response.json();
        return data["categories"];
    } else {
        return [];
    }
}
async function fetchTeams() {
    const response = await authFetch("/api/my-teams")
    if (response.ok) {
        const data = await response.json();
        return data["teams"];
    } else {
        return [];
    }
}
export async function fetchRoomsFiltered(city = null, category = null, team = null, members = null) {
    const filters = {};
    if (city) {
        filters["city"] = city;
    }
    if (category) {
        filters["category"] = category;
    }
    if (team) {
        filters["team"] = team;
    }
    if (members) {
        filters["players"] = members;
    }
    const response = await fetch("/api/rooms/filter", {
        method: "POST",
        body: JSON.stringify(filters),
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (response.ok) {
        const data = await response.json();
        return data["rooms"];
    } else {
        return [];
    }
}


function EscapeRoomsContent() {
    const { user } = useAuth();
    const animatedComponents = makeAnimated();

    const [cities, setCities] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    useEffect(() => {
        fetchCities()
            .then((newCities) => {
                setCities(newCities);
            });
    }, []);
    const handleCitySelect = (opt) => setSelectedCity(opt ? opt.value : null);

    const [categories, setCategories] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    useEffect(() => {
        fetchCategories()
            .then((newCategories) => {
                setCategories(newCategories);
            });
    }, [])
    const handleCategorySelect = (opt) => setSelectedCategory(opt ? opt.value : null);

    const [teams, setTeams] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    useEffect(() => {
        if (user) {
            fetchTeams()
                .then((newTeams) => {
                    setTeams(newTeams);
                });
        } else {
            setTeams(null);
        }
    }, [user]);
    const handleTeamSelect = (opt) => setSelectedTeam(opt ? opt.team : null);

    const [selectedMembers, setSelectedMembers] = useState(null);
    useEffect(() => {
        setSelectedMembers(null);  // todo clear selected members when team changes
    }, [selectedTeam]);
    const handleMembersSelect = (values) => {
        if (values && values.length === 0) {
            values = null;
        } else {
            values = values.map((v) => v.value);
        }
        setSelectedMembers(values);
    }

    const [rooms, setRooms] = useState(null);

    const [initPos, setInitPos] = useState([0, 0]);
    const [initZoom, setInitZoom] = useState(7);
    useEffect(() => {
        if (rooms === null || rooms.length === 0) {
            const defaultCenter = [45, 16.5];
            const defaultZoom = 7;
            setInitPos(defaultCenter);
            setInitZoom(defaultZoom);
        } else {
            const { center, zoom } = calculateMapCenterZoom(rooms.map((room) => [room.geo_lat, room.geo_long]));
            setInitPos(center);
            setInitZoom(zoom);
        }
    }, [rooms]);

    const handleFilterClick = () => {
        const city = selectedCity;
        const category = selectedCategory;
        const team = selectedTeam;
        const members = selectedMembers;
        console.log("filter", city, category, team, members);
    }

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
            <section className={"escape-rooms-form"}>
                <h2>Odaberi svoju sljedeću avanturu!</h2>
                <p>Više od 100 Escape roomova iz cijele Hrvatske! Odaberite i rezevirajte.</p>
                <div>
                    <Select
                        components={animatedComponents}
                        options={cities ? cities.map((city) => ({ value: city, label: city })) : []}
                        isLoading={cities === null}
                        isMulti={false}
                        isClearable={true}
                        placeholder="Grad"
                        onChange={handleCitySelect}
                        className="escape-rooms-form-city escape-rooms-form-select"
                    />
                    <Select
                        components={animatedComponents}
                        options={categories ? categories.map((cat) => ({ value: cat, label: cat })) : []}
                        isLoading={categories === null}
                        isMulti={false}
                        isClearable={true}
                        placeholder="Žanr"
                        onChange={handleCategorySelect}
                        className="escape-rooms-form-category escape-rooms-form-select"
                    />
                    {user && <>
                        <Select
                            components={animatedComponents}
                            options={teams ? teams.map((team) => ({ value: team.name, label: team.name, team: team })) : []}
                            isLoading={teams === null}
                            isMulti={false}
                            isClearable={true}
                            placeholder="Tim"
                            onChange={handleTeamSelect}
                            className="escape-rooms-form-team escape-rooms-form-select"
                        />
                        <Select
                            components={animatedComponents}
                            options={selectedTeam ? sortArr(selectedTeam.members.concat([selectedTeam.leader])) : []}
                            isLoading={teams === null}  // the fetch for teams also fetches members
                            isMulti={true}
                            isClearable={true}
                            placeholder="Članovi tima"
                            onChange={handleMembersSelect}
                            className="escape-rooms-form-members escape-rooms-form-select"
                        />
                    </>}
                    <Button1 text={"PRETRAŽI"} onClick={handleFilterClick}/>
                </div>

            </section>
            <section className={"escape-rooms-map-section"}>
                <MapContainer className="escape-rooms-page-map" center={initPos} zoom={initZoom} scrollWheelZoom={true} attributionControl={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                    <Marker position={initPos}>
                        <Popup>A pretty CSS3 popup.<br/>Easily customizable.</Popup>
                    </Marker>
                </MapContainer>
            </section>
            <section>
                -- Escape Room Tiles --
            </section>
        </div>
  );

}
function EscapeRoomsPage() {
  const name = "escape-rooms";
  return <PageTemplate name={name} body={<EscapeRoomsContent />} />;
}

export default EscapeRoomsPage;
