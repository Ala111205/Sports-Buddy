import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {auth} from "../firebase";
import axios from "axios";

export default function Register(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("");

    const [show, setShow] = useState({
        password: true,
        rePassword: true
    });

    const navigate = useNavigate();

    const togglePassword = (field)=>{
        setShow((prev)=>({...prev, [field]: !prev[field]}))
    }

    async function handleSignUp(e){
        e.preventDefault();
        if (password !== rePassword){
            return alert("Password does not match")
        }
        else if(!email || !password || !rePassword || !name || !role || role === "--select--"){
            return alert("All the fields are mandatory!")
        }

        try {
            // ✅ 1. Create user in Firebase Auth
            const cred = await createUserWithEmailAndPassword(auth, email, password);

            // ✅ 2. Update profile with displayName
            await updateProfile(cred.user, { displayName: name });

            // ✅ 3. Get ID token
            const idToken = await cred.user.getIdToken();

            // ✅ 4. Send details to backend
            const res = await axios.post(
                "http://localhost:4800/api/users/register",
                {
                uid: cred.user.uid,
                email,
                name,
                password, // optional, depends on your backend needs
                role,
                },
                {
                headers: { Authorization: `Bearer ${idToken}` },
                }
            );

            console.log("✅ Response:", res.data);
            alert("Registration successful!");
            navigate("/Login")
            } catch (error) {
            console.error("❌ Error in signup:", error);
            alert(error.message);
            }
    };

    return(
        <>
        <div className="register">
            <form onSubmit={handleSignUp}>
                <h2>Register</h2>
                <div>
                    <input type="text" placeholder="" onChange={(e)=>{setName(e.target.value)}}/>
                    <label>Enter Your Name</label>
                </div>
                <div>
                    <input type="text" placeholder="" onChange={(e)=>{setEmail(e.target.value)}}/>
                    <label>Enter Your Email</label>
                </div>
                <div>
                    <input type={show.password? "password": "text"} placeholder="" onChange={(e)=>{setPassword(e.target.value)}} />
                    <label>Enter the Password</label>
                    {show.password? <FaEyeSlash className="eye"  onClick={()=>togglePassword("password")}/>: <FaEye className="eye" onClick={()=>togglePassword("password")} />}
                </div>
                <div>
                    <input type={show.rePassword? "password": "text"} placeholder="" onChange={(e)=>{setRePassword(e.target.value)}} />
                    <label>Enter the Re-Password</label>
                    {show.rePassword? <FaEyeSlash className="eye" onClick={()=>togglePassword("rePassword")}/>: <FaEye className="eye" onClick={()=>togglePassword("rePassword")} />}
                </div>
                <select value={role} onChange={(e)=>setRole(e.target.value)}>
                    <option value="">---Select---</option> 
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit">Signup</button>
            </form>
        </div>
        </>
    )
}