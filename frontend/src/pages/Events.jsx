import { HiDotsVertical } from "react-icons/hi";
import { FaEdit } from "react-icons/fa";
import { AiTwotoneDelete } from "react-icons/ai";
import { useContext, useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';


delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export default function Events(){
    const {sportId} = useParams();
    const locations = useLocation();

    console.log("Sport Id from URL: ", sportId);
    const {user, mongoUser} = useContext(AuthContext);

    const [editing, setEditing] = useState(false);
    const [events, setEvents] = useState([]);
    const [showIcons, setShowIcons] = useState(null);
    const [currentEventId, setCurrentEventId] = useState(null);
    const [currentSportId, setCurrentSportId] = useState(null);
    const [location, setLocation] = useState("");
    const [coordinates, setCoordinates] = useState([20, 77]);

    const [sportEvent, setSportEvent] = useState({
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

    console.log("Updating sportId:", currentSportId);
            console.log("Updating eventId:", currentEventId);
            console.log("sportEvent data:", sportEvent);

   useEffect(() => {
        // fetch events (unchanged)
        async function fetchData() {
            try {
            const res = await axios.get("http://localhost:4800/api/events");
            const filtered = sportId
                ? res.data.filter(ev => ev.sport?._id === sportId)
                : res.data;
            setEvents(filtered);
            } catch (err) {
            alert(err.response?.data?.error || err.message);
            }
        }
        fetchData();

        function handleSpaceKey(e) {
            const isSpace = e.code === 'Space' || e.key === ' ';
            const activeEl = document.activeElement;

            const isEditable =
                /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(activeEl.tagName) ||
                activeEl.isContentEditable;

            // Only prevent scrolling if space pressed outside inputs
            if (isSpace && !isEditable) {
                e.preventDefault(); // prevents page from jumping
                // Do NOT stop propagation unless necessary
            }
        }

        window.addEventListener('keydown', handleSpaceKey);

        return () => window.removeEventListener('keydown', handleSpaceKey);
    }, [locations.key]);

    const handleData = (e)=>{
        const {name, value} = e.target;
        setSportEvent((prev) => ({
            ...prev,
            [name]: name === "startDate" ? (value ? new Date(value).toISOString() : "") : value
        }));
    };

   async function handleUpdate(e) {
        e.preventDefault();

        try {
            if (!user) return alert("Login first");
            if (mongoUser?.role !== "admin") return alert("Admin Only");

            const token = await user.getIdToken(true);

            // 1️⃣ Update Sport document
            const updatedSportRes = await axios.put(
                `http://localhost:4800/api/sports/${currentSportId}`,
                {
                    name: sportEvent.sportName,
                    rules: sportEvent.rules,
                    players: sportEvent.players,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedSport = updatedSportRes.data;

            // 2️⃣ Update Event document
            const updatedEventRes = await axios.put(
                `http://localhost:4800/api/events/${currentEventId}`,
                {
                    title: sportEvent.title,
                    startDate: sportEvent.startDate ? new Date(sportEvent.startDate) : null,
                    city: sportEvent.city,
                    area: sportEvent.area,
                    description: sportEvent.description,
                    location: {
                    type: "Point",
                    coordinates: [coordinates[1], coordinates[0]]},
                    sport: currentSportId, // reference the updated sport
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedEvent = updatedEventRes.data;

            // 3️⃣ Update UI state
            setEvents((prevEvents) =>
                prevEvents.map((ev) =>
                    ev._id === currentEventId
                        ? {
                            ...updatedEvent,
                            sport: updatedSport, // embed the updated sport object for UI
                        }
                        : ev
                )
            );

            alert("Event Updated");
            setEditing(false);
        } catch (error) {
            alert(error.response?.data?.error || error.message);
        }
    }


    async function handleDelete(sportId, eventId){
        if(!eventId) {
            return console.log("There is no event id found")
        }else{
            console.log("Event: ", eventId)
        }
        console.log(sportId)
        try {
            if(!user) return alert("Login first");
            if(mongoUser?.role !== "admin") return alert("Admin Only");

            if (!window.confirm('Are you sure you want to delete this event?')) return;

            const token = await user.getIdToken();

            await axios.delete(`http://localhost:4800/api/events/${eventId}`, {headers: {Authorization: `Bearer ${token}`}});

            
            // ✅ Update local state
            setEvents(prevEvents => prevEvents.filter(ev => ev._id !== eventId));

            alert("Event deleted");
        } catch (error) {
            alert(error.response?.data?.error || error.message);
        }
    };

    
    function LocationPicker({ setCoordinates }) {
        useMapEvents({
            click(e) {
            const coords = [e.latlng.lat, e.latlng.lng];
            setCoordinates(coords); // pass back to parent
            },
        });
        return null;
    }
    
    return(
        <>
        <div className="handleView">
            {!editing? <>
            {Array.isArray(events) && events.map((ev)=>{
                console.log(ev);
                console.log("Location: ", ev.location);
                console.log("Sport: ",ev.sport);
                return(
                    <div key={ev._id} className="viewDetails">
                        <div>
                            <p><span>Start Date:</span> {new Date(ev.startDate).toLocaleDateString()}</p>
                            <div>
                                <p onClick={()=>setShowIcons(showIcons === ev._id? null: ev._id)}><HiDotsVertical /></p>
                                {showIcons === ev._id  && (
                                    <div className="handleIcon">
                                        <FaEdit className="iconBorder" onClick={()=>{if(mongoUser?.role !== "admin") return alert("Admin only"); setEditing(true); setCurrentEventId(ev._id);
                                                            setCurrentSportId(ev.sport?._id || null); setSportEvent({title: ev.title,
                                                                                                                    startDate: ev.startDate,
                                                                                                                    sportName: ev.sport?.name || "",
                                                                                                                    rules: ev.sport?.rules || "",
                                                                                                                    players: ev.sport?.players || "",
                                                                                                                    city: ev.city,
                                                                                                                    area: ev.area,
                                                                                                                    location: ev.location ? `${ev.location.coordinates[1]}, ${ev.location.coordinates[0]}` : [28.6139, 77.2090],
                                                                                                                    description: ev.description}); 

                                                                                                                    setCoordinates([
                                                                                                                        ev.location?.coordinates[1], 
                                                                                                                        ev.location?.coordinates[0], 
                                                                                                                    ]);

                                                                                                                    setLocation(
                                                                                                                    ev.location? `${ev.location.coordinates[1]}, ${ev.location.coordinates[0]}` : "");}} />
                                        <AiTwotoneDelete className="iconBorder" onClick={()=>{if(mongoUser?.role !== "admin") return alert("Admin only"); handleDelete(ev.sport?._id, ev._id)}} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <h2>{ev.title}</h2>
                        <div>
                            <p><span>SportName:</span> {ev.sport?.name || undefined}</p>
                            <p><span>Rules:</span> {ev.sport?.rules || undefined}</p>
                            <p><span>Players:</span> {ev.sport?.players || undefined}</p>
                        </div>
                        <div>
                            <p><span>City:</span> {ev.city}</p>
                            <p><span>Area:</span> {ev.area}</p>
                        </div>
                            {ev.location?.coordinates &&
                            ev.location.coordinates[0] != null &&
                            ev.location.coordinates[1] != null &&(
                            <div style={{ height: "330px", width: "100%", maxWidth: "700px", marginTop: "8px", border: "2px solid black", position: "relative" }}>
                                <MapContainer
                                    center={[ev.location.coordinates[1], ev.location.coordinates[0]]}
                                    zoom={13}
                                    minZoom={2}
                                    maxZoom={18}
                                    scrollWheelZoom={false}
                                    style={{ height: "100%", width: "100%" }}
                                    >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="&copy; OpenStreetMap contributors"
                                    />
                                    <Marker position={[ev.location.coordinates[1], ev.location.coordinates[0]]}>
                                        <Popup>
                                        <strong>City:</strong> {ev.city} <br />
                                        <strong>Area:</strong> {ev.area} <br />
                                        {ev.sport?.name && <><strong>Sport:</strong> {ev.sport.name}</>}
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                            )}
                        <div>
                            <h2>Descrption:-</h2>
                            <p>{ev.description}</p>
                        </div>
                        </div>
                )
            })}
            </>: <>
            <div className="upgradeForm">
                <h1>Upgrade Form</h1>
                <form onSubmit={handleUpdate}>
                    <div className="inputContainer">
                        <input type="date" placeholder="Start Date" name="startDate" value={  sportEvent.startDate? (() => {
          const date = new Date(sportEvent.startDate);
          return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
        })()
      : ""} onChange={handleData} />
                        <input type="text" placeholder="Title" name="title" value={sportEvent.title} onChange={handleData} />
                        <input type="text" placeholder="Sport Name" name="sportName" value={sportEvent.sportName} onChange={handleData} />
                        <input type="text" placeholder="Rules" name="rules" value={sportEvent.rules} onChange={handleData} />
                        <input type="text" placeholder="Players" name="players" value={sportEvent.players} onChange={handleData} />
                        <input type="text" placeholder="City" name="city" value={sportEvent.city} onChange={handleData} />
                        <input type="text" placeholder="Area" name="area" value={sportEvent.area} onChange={handleData} />
                        <div style={{ height: "250px", width: "100%", marginTop: "8px", border: "2px solid black" }}>
                            <MapContainer
                                center={coordinates}
                                zoom={13}
                                minZoom={2}
                                maxZoom={18}
                                style={{ height: "100%", width: "100%" }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"
                                />
                                <Marker position={coordinates}/>
                                <LocationPicker
                                    setCoordinates={(coords) => {
                                        setCoordinates(coords); // update marker
                                        setLocation(`${coords[0]}, ${coords[1]}`); // also update string state
                                    }}
                                />
                            </MapContainer>
                    </div>
                        <textarea placeholder="Description..." name="description" value={sportEvent.description} onChange={handleData} ></textarea>
                    </div>
                    <button style={editing ? {backgroundColor: "transparent"}: {}} type="submit">Update</button>
                </form>
            </div>
            </>}
        </div>
        </>
    )
}