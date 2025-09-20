import { FaBars } from "react-icons/fa6";
import { AiFillCloseCircle } from "react-icons/ai";
import { Link, useLocation } from "react-router-dom";
import {useState, useContext, useEffect} from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function Navbar(){
    const {user} = useContext(AuthContext);

    const [show, setShow] = useState(true);

    const [activeLink, setActiveLink] = useState("");

    const location = useLocation();

    const handletoggle = ()=>{
        setShow(!show)
    }

    const handleActive = (link)=>{
        setActiveLink(link);
        sessionStorage.setItem("lastActive", link)
    }

    // set active link when route changes
    useEffect(() => {
        const saved = sessionStorage.getItem("lastActive");

        if(saved){
            setActiveLink(saved);
            return;
        }

    }, [location.pathname]);

    return(
        <>
        <div className="navbar">
            <h1>Sports Buddy</h1>
            <div className={show? "center": "down"}>
                <Link to="/" onClick={()=>handleActive("/")} className={activeLink === "/"? "active": ""}>Home</Link>
                <Link to="/Sports" onClick={()=>handleActive("/Sports")} className={activeLink === "/Sports"? "active": ""}>Sports</Link>
                <Link to="/events" onClick={()=>handleActive("/Events")} className={activeLink === "/Events"? "active": ""}>Events</Link>
                {user ? <Link to="/Create" onClick={()=>handleActive("/Create")} className={activeLink === "/Create"? "active": ""}>Create</Link>:
                <>
                <Link to="/Login" onClick={()=>handleActive("/Login")} className={activeLink === "/Login"? "active": ""}>Login</Link>
                </>
                }
            </div>
            <h2 className="iconContainer">{show? <FaBars onClick={handletoggle}/>: <AiFillCloseCircle onClick={handletoggle}/>}</h2>
        </div>
        </>
    )
}