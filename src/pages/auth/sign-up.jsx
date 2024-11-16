import React, { useState } from "react";
import { createUser } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import './auth.css';

export default function SignUp() {
  const [formData, setFormData] = useState({ name: "", document:"", email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      navigate("/");
    } catch (err) {
      setError("Erro ao cadastrar. Tente novamente.");
    }
  };

  return (
    <div className="auth-card">
      <h2>Faça seu cadastro</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="name" 
          placeholder="Nome" 
          value={formData.name} 
          onChange={handleChange} 
          required 
        />
         <input 
          type="text" 
          name="document" 
          placeholder="CPF/CNPJ" 
          value={formData.document} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Senha" 
          value={formData.password} 
          onChange={handleChange} 
          required 
        />
        <button type="submit">Cadastrar</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <a className="auth-link" href="/">Já tem uma conta? Faça login</a>
      </form>
    </div>
  );
};


