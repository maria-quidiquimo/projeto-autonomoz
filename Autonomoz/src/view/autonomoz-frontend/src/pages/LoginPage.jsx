import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import logoImg from '../assets/logo.png';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [matricula, setMatricula] = useState(() => localStorage.getItem('autonomoz_saved_matricula') || '');
  const [senha, setSenha] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!matricula || !senha) {
      toast.warning('Informe a matrícula e a senha.');
      return;
    }

    setLoading(true);
    const result = await login(matricula, senha);
    setLoading(false);

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('autonomoz_saved_matricula', matricula);
      } else {
        localStorage.removeItem('autonomoz_saved_matricula');
      }
      toast.success(`Bem-vindo, ${result.user?.nome || 'Operador'}!`);
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(result.error || 'Credenciais inválidas. Verifique sua matrícula e senha.');
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-surface-container-low selection:bg-primary/20 selection:text-primary">
      {/* Subtle background glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden flex items-center justify-center opacity-40">
        <div className="w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="w-[450px] h-[450px] rounded-full bg-tertiary/10 blur-[90px] -mt-32 -ml-32"></div>
      </div>

      <div className="w-full max-w-[480px] flex flex-col items-center">
        <div className="w-full bg-surface-container-lowest text-on-surface rounded-xl shadow-2xl border border-outline-variant/40 overflow-hidden relative">
          {/* Accent top bar */}
          <div className="h-1.5 w-full bg-primary" />

          <div className="p-6 sm:p-8 flex flex-col gap-6">
            {/* Header / Logo */}
            <div className="flex flex-col items-center text-center">
              <div className="h-16 flex items-center justify-center mb-3">
                <img
                  src={logoImg}
                  alt="Autonomoz Logo"
                  className="h-14 w-auto object-contain rounded-md shadow-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-secondary-container/40 text-on-secondary-container mb-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-code text-[11px] uppercase tracking-wider font-semibold">
                  Terminal Ativo • Linha Industrial
                </span>
              </div>

              <h1 className="font-headline-lg text-[22px] font-bold text-on-surface">
                Acesso ao Sistema
              </h1>
              <p className="text-body-md text-secondary mt-0.5">
                Terminal Operacional de Oficina e Produção
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="matricula"
                  className="text-label-sm text-[12px] uppercase tracking-wider text-secondary font-semibold flex items-center justify-between"
                >
                  <span>Matrícula Operacional</span>
                  <span className="font-label-code text-[11px] text-secondary/70 lowercase">
                    ex: OP-4820
                  </span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none">
                    badge
                  </span>
                  <input
                    id="matricula"
                    type="text"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    placeholder="Ex: OP-4820"
                    required
                    autoComplete="username"
                    className="w-full h-12 pl-10 pr-4 bg-surface-container-low text-on-surface text-body-md rounded-md border border-outline/30 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="senha"
                  className="text-label-sm text-[12px] uppercase tracking-wider text-secondary font-semibold flex items-center justify-between"
                >
                  <span>Senha de Terminal</span>
                  <span className="text-[11px] text-tertiary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">lock</span>
                    4 a 8 dígitos
                  </span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none">
                    lock_clock
                  </span>
                  <input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full h-12 pl-10 pr-11 bg-surface-container-low text-on-surface text-body-md rounded-md border border-outline/30 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 p-1.5 rounded text-secondary hover:text-on-surface transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary bg-surface-container-low border-outline/30"
                  />
                  <span className="text-body-sm text-on-surface">
                    Lembrar terminal neste dispositivo
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 bg-primary hover:bg-primary-container text-on-primary font-bold text-body-md rounded-md shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer min-h-[44px]"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">
                    progress_activity
                  </span>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <span className="material-symbols-outlined text-[20px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-1 border-t border-outline-variant/20">
              <span className="text-body-sm text-secondary inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Não possui acesso? Solicite cadastro ao seu gerente.
              </span>
            </div>
          </div>

          {/* Footer bar */}
          <div className="px-6 py-3 bg-surface-container-low border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-2 text-secondary font-label-code text-[12px]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span>Autonomoz ICS v2.4</span>
            </div>
            <span>•</span>
            <span>Terminal Seguro SSL</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-secondary font-body-sm text-[12px]">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-tertiary">cell_tower</span>
            <span>Rede Industrial Privada</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">touch_app</span>
            <span>Modo Touch Otimizado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
