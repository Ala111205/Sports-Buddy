import React, {createContext, useEffect, useState} from "react";
import {auth} from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({children}){
    const [user, setUser] = useState(null);
    const [mongoUser, setMongoUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL;
    
    console.log("VITE_API_URL: ", API_URL);

    useEffect(()=>{
        const unsub = onAuthStateChanged(auth, (u)=>{
            setUser(u);
            setLoading(false);

            if(u){
                const fetchMongoUser = async ()=>{
                    try {
                    const token = await u.getIdToken();
                    const res = await axios.get(`${API_URL}/api/auth/me`, {
                        headers: {Authorization: `Bearer ${token}`}
                    });
                    setMongoUser(res.data);
                    } catch (error) {
                        console.error("Error fetching MongoDB user:", error);
                        setMongoUser(null);
                    }
                }
                fetchMongoUser();
            }
            else{
                setMongoUser(null);
            }
        });
        return ()=>unsub();
    },[]);

    return <AuthContext.Provider value={{user, loading, mongoUser, API_URL}}>
        {children}
    </AuthContext.Provider>
};