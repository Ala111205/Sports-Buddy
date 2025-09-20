import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import {use, useState} from "react"; 
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import {auth} from "../firebase";

export default function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [LoginFailed, setLoginFailed] = useState(false);

    const [show, setShow] = useState(true);
    const togglePassword = ()=>{
        setShow(!show)
    };

    const navigate = useNavigate();

    async function handleLogin(e){
        e.preventDefault();
        if (!email || !password) {
            alert("Email and password are required");
            return;
        }
        try {
            const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
            console.log("✅ Logged in:", cred.user);
            setLoginFailed(false);

            navigate("/create");
        } catch (err) {
            setLoginFailed(true);
            console.error("❌ Login failed:", err);
            alert(err.message);
        }
    };

    async function handleForgotPassword() {
        if (!email) {
            alert("Enter your email to reset password");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email.trim());
            alert("✅ Password reset email sent!");
        } catch (err) {
            console.error("❌ Error sending reset email:", err);
            alert(err.message);
        }
    }
    const handlePasswordChange = (e)=>{
        setPassword(e.target.value);
        setLoginFailed(false);
    }
    return(
        <>
        <div className="login">
            <form onSubmit={handleLogin}>
                <h2>Login</h2>
                <div>
                    <input type="text" onChange={(e)=>setEmail(e.target.value)} placeholder="Enter your email" />
                    <MdEmail className="icon"/>
                </div>
                <div>
                    <input type={show? "password": "text"} onChange={handlePasswordChange} placeholder="Enter your password" />
                    {show? <FaRegEyeSlash className="icon" onClick={togglePassword}/>: <FaRegEye className="icon" onClick={togglePassword}/>}
                </div>
                {LoginFailed? <button onClick={handleForgotPassword}>Forgot Password</button>: <button>Signin</button>}
                <h3>Don't have an account? <Link to="/Register">Singup</Link></h3>
            </form>
        </div>
        </>
    )
}