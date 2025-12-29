import React, {useEffect, useState} from "react";
import PageTemplate from "./PageTemplate";
import RoomTile from "../components/RoomTile";
import {useAuth} from "../context/AuthContext";
import Button1 from "../components/Button1";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import {authFetch} from "../context/AuthContext";
import Select from "react-select";
import makeAnimated from 'react-select/animated';


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


function EscapeRoomsContent() {
    const { user } = useAuth();
    const animatedComponents = makeAnimated();

    const [citiesOpts, setCitiesOpts] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    useEffect(() => {
        fetchCities()
            .then((newCities) => {
                setCitiesOpts(newCities.map((city) => ({ value: city, label: city })));
            })
            .catch((err) => {
                setCitiesOpts(null);
            });
    }, []);
    const handleCitySelect = (value) => setSelectedCity(value);

    const [categoriesOpts, setCategoriesOpts] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    useEffect(() => {
        fetchCategories()
            .then((newCategories) => {
                setCategoriesOpts(newCategories.map((cat) => ({ value: cat, label: cat })));
            }).catch((err) => {
                setCategoriesOpts(null);
            });
    }, [])
    const handleCategorySelect = (value) => setSelectedCategory(value);

    const [teams, setTeams] = useState(null);
    const [teamsOpts, setTeamsOpts] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    useEffect(() => {
        if (user) {
            fetchTeams()
                .then((newTeams) => {
                    setTeams(newTeams);
                    setTeamsOpts(newTeams.map((team) => ({ value: team.name, label: team.name })));
                }).catch((err) => {
                    setTeams(null);
                    setTeamsOpts(null);
                });
        } else {
            setTeamsOpts(null);
        }
    }, [user]);
    const handleTeamSelect = (value) => setSelectedTeam(value);

    const [memberOpts, setMemberOpts] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState(null);
    useEffect(() => {
        setSelectedMembers(null);  // todo clear selected members when team changes
        if (selectedTeam) {
            const team = teams.find((t) => t.name === selectedTeam.value);
            if (team) {
                let members = (team.members || []).concat(team.leader || []);
                setMemberOpts(members.map((member) => ({ value: member.username, label: member.username })));
            } else {
                setMemberOpts(null);
            }
        } else {
            setMemberOpts(null);
        }
    }, [selectedTeam]);
    const handleMembersSelect = (values) => {
        if (values && values.length === 0) {
            values = null;
        }
        setSelectedMembers(values);
    }

    const [rooms, setRooms] = useState(null);

    const [initMapPos, setInitMapPos] = useState([0, 0]);
    useEffect(() => {
        if (!rooms || rooms.length === 0) {
            setInitMapPos([45.8150, 15.9819]); // Default to Zagreb
            return;
        }
        let geo_lat = 0;
        let geo_long = 0;
        console.log("here1");
        for (let room of rooms) {
            geo_lat += room.geo_lat;
            geo_long += room.geo_long;
        }
        geo_lat = geo_lat / rooms.length;
        geo_long = geo_long / rooms.length;
        setInitMapPos([geo_lat, geo_long]);
    }, [rooms]);

    const handleFilterClick = () => {
        console.log("filter");
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
                        options={citiesOpts || []}
                        isLoading={citiesOpts === null}
                        isMulti={false}
                        placeholder="Grad"
                        onChange={handleCitySelect}
                        className="escape-rooms-form-city"
                    />
                    <Select
                        components={animatedComponents}
                        options={categoriesOpts || []}
                        isLoading={categoriesOpts === null}
                        isMulti={false}
                        placeholder="Žanr"
                        onChange={handleCategorySelect}
                        className="escape-rooms-form-category"
                    />
                    {user && <>
                        <Select
                            components={animatedComponents}
                            options={teamsOpts || []}
                            isLoading={teamsOpts === null}
                            isMulti={false}
                            placeholder="Tim"
                            onChange={handleTeamSelect}
                            className="escape-rooms-form-team"
                        />
                        <Select
                            components={animatedComponents}
                            options={memberOpts || []}
                            isLoading={teamsOpts === null}  // the fetch for teams also fetches members
                            isMulti={true}
                            placeholder="Članovi tima"
                            onChange={handleMembersSelect}
                            className="escape-rooms-form-members"
                        />
                    </>}
                    <Button1 text={"Pretraži"} onClick={handleFilterClick}/>
                </div>

            </section>
            <section className={"escape-rooms-map-section"}>
                <MapContainer className="escape-rooms-page-map" center={initMapPos} zoom={13} scrollWheelZoom={true} attributionControl={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                    <Marker position={initMapPos}>
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
