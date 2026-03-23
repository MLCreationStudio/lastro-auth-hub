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

  const inputStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif',
    fontSize: '15px',
    color: '#F5F0E8',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(245,240,232,0.2)',
    outline: 'none',
    padding: '12px 0',
    width: '100%',
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center w-full max-w-sm px-6">
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px' }} className="text-foreground mb-2">
          Crie sua conta
        </h1>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: 'rgba(245,240,232,0.5)' }} className="italic mb-8">
          Seu diagnóstico fica salvo. Sempre.
        </p>
        <form onSubmit={handleSignUp} className="w-full flex flex-col gap-6">
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-[6px] mt-2"
            style={{ fontFamily: 'Georgia, serif', fontSize: '16px' }}
          >
            {loading ? '...' : 'Criar conta'}
          </button>
          {error && (
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '13px', color: 'rgba(229, 83, 75, 0.8)' }}>
              {error}
            </p>
          )}
        </form>
        <button
          onClick={() => navigate('/login')}
          className="mt-6"
          style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: 'rgba(245,240,232,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Já tenho conta → entrar
        </button>
      </div>
    </div>
  );
};

export default Cadastro;
