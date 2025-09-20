import React, {createContext, useEffect, useState} from "react";
import {auth} from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({children}){
    const [user, setUser] = useState(null);
    const [mongoUser, setMongoUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const unsub = onAuthStateChanged(auth, (u)=>{
            setUser(u);
            setLoading(false);

            if(u){
                const fetchMongoUser = async ()=>{
                    try {
                    const token = await u.getIdToken();
                    const res = await axios.get("http://localhost:4800/api/auth/me", {
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

    return <AuthContext.Provider value={{user, loading, mongoUser}}>
        {children}
    </AuthContext.Provider>
};