import { useState, type FormEvent } from "react";

const USUARIO = "teste";
const SENHA = "123";

interface LoginProps {
  onEntrar: () => void;
}

export default function Login({ onEntrar }: LoginProps) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (usuario === USUARIO && senha === SENHA) {
      onEntrar();
    } else {
      setErro("Usuário ou senha inválidos.");
    }
  }

  return (
    <div className="login">
      <form className="login__cartao" onSubmit={enviar}>
        <h1 className="login__logo">TourGuide</h1>
        <p className="login__subtitulo">Entre para planejar suas viagens</p>

        <label className="login__rotulo">
          Usuário
          <input
            className="login__campo"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </label>

        <label className="login__rotulo">
          Senha
          <input
            className="login__campo"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {erro && <p className="login__erro">{erro}</p>}

        <button className="login__entrar" type="submit">
          Entrar
        </button>
      </form>
    </div>
  );
}
