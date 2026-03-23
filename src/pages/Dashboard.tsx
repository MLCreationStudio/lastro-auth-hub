import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const secondaryCards = [
  {
    title: 'Mapa de GTM',
    subtitle: 'disponível após o diagnóstico',
  },
  {
    title: 'Tracker semanal',
    subtitle: 'disponível após o diagnóstico',
  },
  {
    title: 'Direção criativa',
    subtitle: 'em breve',
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login');
        return;
      }

      setEmail(session.user.email || '');
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
        return;
      }

      setEmail(session.user.email || '');
      setLoading(false);
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background px-6 py-12 md:px-12">
      <main className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between">
          <p className="font-display text-[22px] italic text-primary">Lastro.</p>
          <button
            onClick={handleLogout}
            className="text-[11px] uppercase tracking-[0.08em] text-[hsl(var(--foreground)/0.2)] transition-colors duration-200 hover:text-[hsl(var(--foreground)/0.4)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98]"
          >
            sair
          </button>
        </header>

        <section className="mt-14 max-w-2xl">
          <h1 className="font-display text-[42px] leading-[0.98] text-foreground md:text-[48px]">Olá.</h1>
          <p className="mt-3 text-sm font-light leading-[1.6] text-[hsl(var(--foreground)/0.35)]">
            O que você quer descobrir hoje?
          </p>
        </section>

        <button
          onClick={() => navigate('/diagnostico')}
          className="mt-12 block w-full max-w-4xl rounded-[14px] border border-[hsl(var(--primary)/0.12)] bg-[hsl(var(--surface))] p-8 text-left transition-colors duration-200 hover:border-[hsl(var(--primary)/0.3)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.995]"
        >
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.1em] text-primary">
            <span className="h-px w-4 bg-primary" />
            <span>módulo 1</span>
          </div>
          <h2 className="mt-4 font-display text-[24px] leading-[1.1] text-foreground md:text-[26px]">
            Diagnóstico de viabilidade
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-light leading-[1.6] text-secondary">
            Descubra o que é possível com o seu orçamento antes de investir.
          </p>
          <p className="mt-6 text-[13px] font-medium text-primary">iniciar diagnóstico →</p>
        </button>

        <section className="mt-3 grid gap-2.5 md:grid-cols-3">
          {secondaryCards.map((card) => (
            <div
              key={card.title}
              className="rounded-[10px] border border-[hsl(var(--foreground)/0.05)] bg-[hsl(var(--deep-surface))] p-5 opacity-40"
            >
              <p className="text-[13px] font-medium text-foreground">{card.title}</p>
              <p className="mt-1.5 text-[11px] leading-[1.5] text-[hsl(var(--foreground)/0.3)]">{card.subtitle}</p>
            </div>
          ))}
        </section>

        <p className="mt-8 text-[11px] uppercase tracking-[0.08em] text-[hsl(var(--foreground)/0.18)]">{email}</p>
      </main>
    </div>
  );
};

export default Dashboard;
