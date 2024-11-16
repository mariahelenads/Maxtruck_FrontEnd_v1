import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../api/axios';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  
  const userId = localStorage.getItem("user_id"); 

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        const data = await getUserProfile(userId);
        setProfile(data);
      } catch (error) {
        console.error("Erro ao obter perfil:", error);
      }
    };

    fetchProfile();
  }, [userId]);

  return (
    <ProfileContext.Provider value={profile}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  return useContext(ProfileContext);
};