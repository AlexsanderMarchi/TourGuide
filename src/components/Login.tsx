import { useState, type FormEvent } from "react";

interface LoginProps {
  onEntrar: () => void;
}

export default function Login({ onEntrar }: LoginProps) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        body: new URLSearchParams({ username: usuario, password: senha }),
      });
      if (resposta.ok) {
        // o navegador já guardou o cookie de sessão
        onEntrar();
      } else {
        setErro("Usuário ou senha inválidos.");
      }
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setEnviando(false);
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

        <button className="login__entrar" type="submit" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
