import React, { useState } from "react";
import { loginUser } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import './auth.css';

export default function SignIn () {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
      console.log(response);
      localStorage.setItem("token", response.data.token);
      console.log(`token :${response.data.token}`)
      navigate("/dashboard"); 
    } catch (err) {
      console.log(err);
      setError("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  return (
    <div className="auth-card">
      <h2>Fazer Login</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Entrar</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <a className="auth-link" href="/sign-up">Não tem uma conta? Cadastre-se</a>
      </form>
    </div>
  );
};


