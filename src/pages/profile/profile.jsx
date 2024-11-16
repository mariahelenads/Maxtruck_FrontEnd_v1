import React from 'react';
import { useProfile } from '../../context/profileContext';
import { useNavigate } from 'react-router-dom'; 
import './profile.css'; 

export default function Profile() {
  const profile = useProfile();
  const navigate = useNavigate(); 

  const handleBack = () => {
    navigate('/dashboard'); 
  };

  return (
    <div className="profile-container">
      <button className="back-button" onClick={handleBack}>
        Voltar para Dashboard
      </button>
      {profile ? ( 
        <>
          <h1>Perfil</h1>
          <p><strong>Nome:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
        </>
      ) : (
        <div>Carregando dados...</div> 
      )}
    </div>
  );
}