import { FaSearchLocation } from "react-icons/fa";
import { useContext, useState, useEffect} from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Import marker images (these become URLs via the bundler)
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export default function CreateEvent(){
    const {user, mongoUser, API_URL} = useContext(AuthContext);

    console.log("User: ", user);
    const [sportEvent, setSportEvent] = useState({
        startDate: "",
        title: "",
        sport: "",
        sportName: "",
        rules: "",
        players: "",
        city: "",
        area: "",
        location: "",
        description: "",
    });

    const [Event, SetEvent] = useState(false);

    const [coordinates, setCoordinates] = useState([28.6139, 77.2090]);

    const [searchQuery, setSearchQuery] = useState("");

    const [streetName, setStreetName] = useState("");


    const handleDetails = (e)=>{
        setSportEvent({...sportEvent, [e.target.name]: e.target.value})
    }

    async function handleCreate(e){
        e.preventDefault();

        try {
            if(!user) return alert("Login First");

            if(mongoUser?.role !== "admin") return alert("Admin Only")
        
            const token = await user.getIdToken();

            console.log("Token: ", token);

            const sports = await axios.post(`${API_URL}/api/sports/create`, {
                name: sportEvent.sportName,
                rules: sportEvent.rules,
                players: sportEvent.players,
            }, {headers: {Authorization: `Bearer ${token}`}});

            console.log("Sports: ", sports);
            const newSportId = sports.data._id

            await axios.post(`${API_URL}/api/events/event-create`, {
            sport: newSportId,
            startDate: sportEvent.startDate,
            title: sportEvent.title,
            city: sportEvent.city,
            area: sportEvent.area,
            location: coordinates ? { type: "Point", coordinates: [coordinates[1], coordinates[0]] } : null,
            description: sportEvent.description
        }, {
            headers: {Authorization: `Bearer ${token}`}
        });

        alert("Event created successfully");

        setSportEvent({
            startDate: "",
            title: "",
            sportName: "",
            rules: "",
            players: "",
            city: "",
            area: "",
            location: "",
            description: "",
        });

        SetEvent(true);
        } catch (error) {
            console.log("Event create failed: ", error)
        }
    }

    function LocationPicker({ location, setLocation }) {
        useMapEvents({
            click(e) {
            setLocation([e.latlng.lat, e.latlng.lng]);
            },
        });

        return location ? <Marker position={location} /> : null;
    }

    async function handleSearch() {
        if (!searchQuery.trim()) return;

        try {
            const response = await fetch(`${API_URL}/api/map/search-location?q=${encodeURIComponent(searchQuery)}`);

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            setCoordinates([lat, lon]); // updates map center and marker

            // Get street name if available, otherwise full display_name
            const street = data[0].address?.road || data[0].display_name;
            setStreetName(street);

            } else {
                alert("Location not found");
                setStreetName("");
            }
        } catch (error) {
            console.error("Search failed:", error);
            setStreetName("");
        }
    }
    
    function RecenterMap({ coords, zoom = 13 }) {
        const map = useMap();
        useEffect(() => {
            if (coords) {
            map.setView(coords, zoom);
            }
        }, [coords, zoom, map]);
        return null;
    }



    return(
        <>
        <div className="create">
            <h1>Admin Only</h1>
            <form onSubmit={handleCreate}>
                <div className="inputContainer">
                        <input type="date" name="startDate" value={sportEvent.startDate} onChange={handleDetails} />
                        <input type="text" placeholder="Title" name="title" value={sportEvent.title} onChange={handleDetails} />
                        <input type="text" placeholder="Sport Name" name="sportName" value={sportEvent.sportName} onChange={handleDetails} />
                        <input type="text" placeholder="Rules" name="rules" value={sportEvent.rules} onChange={handleDetails} />
                        <input type="text" placeholder="Players" name="players" value={sportEvent.players} onChange={handleDetails} />
                        <input type="text" placeholder="City" name="city" value={sportEvent.city} onChange={handleDetails} />
                        <input type="text" placeholder="Area" name="area" value={sportEvent.area} onChange={handleDetails} />
                        <div className="mapper">
                            <div style={{width: "230px", display: "flex", gap: "8px", marginBottom: "8px", position: "relative" }}>
                                <input
                                    type="text"
                                    placeholder="Search location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ flex: 1, padding: "6px" }}
                                />
                                <h2 style={{position: "absolute", top: "6.5px", right: "2.5px", backgroundColor: "#fff", borderRadius: "8px"}} type="button" onClick={handleSearch}><FaSearchLocation /></h2>
                            </div>
                            <MapContainer
                                center={coordinates || [20, 77]} // default center
                                zoom={2}                 // initial zoom
                                minZoom={5}              // prevent too far in
                                maxBounds={[[-85, -180],[85,180]]} // bounding box of world
                                maxBoundsViscosity={1.0} // strong clamp to bounds
                                scrollWheelZoom={true}
                                style={{ height: "250px", width: "90%" }}
                                >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"
                                    noWrap={true}  
                                />
                                <Marker position={coordinates}>
                                    <Popup>
                                        <strong>Street:</strong> {streetName}
                                    </Popup>
                                </Marker>
                                <RecenterMap coords={coordinates} />
                                <LocationPicker location={coordinates} setLocation={setCoordinates} />
                                </MapContainer>
                            <p style={{width: "100%", textAlign: "center"}}>
                                Selected: {coordinates ? `${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}` : "None"}
                            </p>
                        </div>
                        <textarea className="detail" name="description" value={sportEvent.description} onChange={handleDetails} placeholder="Describe..."></textarea>
                </div>
                <button style={Event ? {}: {backgroundColor: "transparent"}} type="submit">Create</button>
            </form>
        </div>        
        </>
    )
}