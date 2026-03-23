import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const Cadastro = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <p className="font-display text-[18px] italic text-primary">Lastro.</p>
        <h1 className="mt-8 font-display text-[36px] leading-none text-foreground">Crie sua conta</h1>
        <p className="mt-3 text-sm font-light italic leading-[1.6] text-secondary">
          Seu diagnóstico fica salvo. Sempre.
        </p>

        <form onSubmit={handleSignUp} className="mt-12 flex w-full flex-col gap-6 text-left">
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border-b border-[hsl(var(--foreground)/0.12)] bg-transparent pb-3 text-[15px] text-foreground outline-none transition-colors duration-200 focus:border-primary"
          />
          <input
            type="password"
            placeholder="senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border-b border-[hsl(var(--foreground)/0.12)] bg-transparent pb-3 text-[15px] text-foreground outline-none transition-colors duration-200 focus:border-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-[8px] bg-primary px-7 py-3 text-[13px] font-medium tracking-[0.01em] text-primary-foreground transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98]"
          >
            {loading ? '...' : 'criar conta'}
          </button>
          {error && <p className="text-[13px] text-destructive">{error}</p>}
        </form>

        <button
          onClick={() => navigate('/login')}
          className="mt-8 text-[12px] text-[hsl(var(--foreground)/0.45)] transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98]"
        >
          Já tenho conta → entrar
        </button>
      </div>
    </div>
  );
};

export default Cadastro;
