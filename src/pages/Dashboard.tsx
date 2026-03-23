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
    <div className="min-h-screen bg-background px-6 pb-24 pt-16 md:px-[60px] md:pt-20">
      <main className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-5xl flex-col justify-center">
        <div className="max-w-xl">
          <h1 className="text-[36px] font-medium leading-[1.08] text-foreground">Olá.</h1>
          <p className="mt-3 text-base italic text-muted-foreground">O que você quer descobrir hoje?</p>
        </div>

        <section className="mt-12 max-w-3xl rounded-[12px] bg-[hsl(var(--surface))] p-8">
          <h2 className="text-[18px] font-medium leading-tight text-foreground">Diagnóstico de viabilidade</h2>
          <p className="mt-3 max-w-lg text-sm italic text-muted-foreground">
            Descubra o que é possível com o seu orçamento antes de investir.
          </p>
          <button
            onClick={() => navigate('/diagnostico')}
            className="mt-6 rounded-[6px] bg-primary px-6 py-3 text-base text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98]"
          >
            Iniciar diagnóstico →
          </button>
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-3">
          {secondaryCards.map((card) => (
            <div key={card.title} className="rounded-[8px] bg-[hsl(var(--surface))] p-5 opacity-50">
              <p className="text-sm text-[hsl(var(--muted-card-foreground))]">{card.title}</p>
              <p className="mt-2 text-sm text-[hsl(var(--muted-card-foreground))]">{card.subtitle}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="fixed inset-x-0 bottom-0 flex items-center justify-between bg-background px-6 py-5 md:px-[60px]">
        <p className="truncate pr-6 text-xs text-[hsl(var(--subtle-foreground))]">{email}</p>
        <button
          onClick={handleLogout}
          className="text-xs text-[hsl(var(--subtle-foreground))] transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98]"
        >
          sair
        </button>
      </footer>
    </div>
  );
};

export default Dashboard;
