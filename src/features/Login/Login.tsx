import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { botaoEntrar, classeCampo, erro as classeErro, rotulo } from "../../shared/estilos";

const fundo =
  "grid h-full place-items-center bg-linear-135 from-sidebar to-sidebar-hover p-4";
const cartao =
  "flex w-full max-w-95 flex-col gap-4 rounded-[14px] bg-white p-8 shadow-login";

export default function Login() {
  const logado = useAuthStore((estado) => estado.logado);
  const entrar = useAuthStore((estado) => estado.entrar);
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { de?: string } | null)?.de ?? "/";
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  // quando o usuário tem A2F, depois da senha certa o login pede o código
  const [etapa, setEtapa] = useState<"credenciais" | "a2f">("credenciais");
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username: usuario, password: senha }),
      });
      if (resposta.ok) {
        // o token chega no cookie HttpOnly (Set-Cookie); o corpo só diz se falta o A2F
        const { a2f } = await resposta.json();
        if (a2f) {
          setEtapa("a2f");
          return;
        }
        entrar();
        navigate(destino, { replace: true });
      } else {
        setErro("Usuário ou senha inválidos.");
      }
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setEnviando(false);
    }
  }

  async function verificarCodigo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const resposta = await fetch("/api/auth/login/verificar-a2f", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: usuario, codigo: codigo.trim() }),
      });
      if (resposta.ok) {
        // código certo: o servidor devolve o token no cookie HttpOnly
        entrar(true);
        navigate(destino, { replace: true });
      } else {
        setErro("Código inválido ou expirado.");
      }
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setEnviando(false);
    }
  }

  function voltarParaCredenciais() {
    setEtapa("credenciais");
    setCodigo("");
    setSenha("");
    setErro("");
  }

  if (logado) {
    return <Navigate to={destino} replace />;
  }

  if (etapa === "a2f") {
    return (
      <div className={fundo}>
        <form className={cartao} onSubmit={verificarCodigo}>
          <h1 className="text-[1.6rem] font-bold text-sidebar">TourGuide</h1>
          <p className="-mt-2.5 text-[0.9rem] text-suave">
            Digite o código de verificação em duas etapas
          </p>

          <label className={rotulo}>
            Código
            <input
              className={classeCampo({ codigo: true })}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
            />
          </label>

          {erro && <p className={classeErro}>{erro}</p>}

          <button
            className={botaoEntrar}
            type="submit"
            disabled={enviando || !codigo.trim()}
          >
            {enviando ? "Verificando..." : "Verificar"}
          </button>

          <button
            className="cursor-pointer p-1 text-[0.9rem] text-suave hover:text-sidebar hover:underline"
            type="button"
            onClick={voltarParaCredenciais}
            disabled={enviando}
          >
            Voltar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={fundo}>
      <form className={cartao} onSubmit={enviar}>
        <h1 className="text-[1.6rem] font-bold text-sidebar">TourGuide</h1>
        <p className="-mt-2.5 text-[0.9rem] text-suave">Entre para planejar suas viagens</p>

        <label className={rotulo}>
          Usuário
          <input
            className={classeCampo()}
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </label>

        <label className={rotulo}>
          Senha
          <input
            className={classeCampo()}
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {erro && <p className={classeErro}>{erro}</p>}

        <button className={botaoEntrar} type="submit" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
