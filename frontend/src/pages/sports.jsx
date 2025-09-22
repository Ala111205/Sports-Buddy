import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";

export default function SportsAvailability() {
  const [events, setEvents] = useState([]);
  const [sportsAvailability, setSportsAvailability] = useState([]);

  const {API_URL} = useContext(AuthContext);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await axios.get(`${API_URL}/api/events`); // populated with sport
        setEvents(res.data);
      } catch (err) {
        console.error(err.response?.data?.error || err.message);
      }
    }

    fetchEvents();
  }, []);

  useEffect(() => {
    const today = new Date();

    const availabilityList = Array.isArray(events)&&events.map((ev) => {
      if (!ev.sport) return null;
      return {
        id: ev._id, // unique event ID
        sport: ev.sport, 
        city: ev.city,
        available: new Date(ev.startDate) >= today,
      };
    }).filter(Boolean); // remove nulls

    setSportsAvailability(availabilityList);
  }, [events]);

  return (
    <div className="sportsList">
      <h1>Sports & Availability</h1>
      {Array.isArray(sportsAvailability)&&sportsAvailability.map((item) => (
        <Link className="sportsAvailability" to={`/events/${item.sport._id}`} key={item.id}>
          <div className="sportCard">
            <h3>{item.sport.name}</h3>
            <p><b>City:</b> {item.city}</p>
            <p>
              <b>Status:{" "}</b>
              <span style={{ color: item.available ? "green" : "red" }}>
                {item.available ? "Open" : "Closed"}
              </span>
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
