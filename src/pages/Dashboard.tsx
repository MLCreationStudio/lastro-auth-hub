import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setEmail(session.user.email || '');
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      }
    });

    checkSession();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background" />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px' }} className="text-foreground">
          Olá, {email}
        </p>
        <button
          onClick={handleLogout}
          className="px-8 py-3 rounded-[6px]"
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            background: 'transparent',
            border: '0.5px solid rgba(245,240,232,0.2)',
            color: 'rgba(245,240,232,0.5)',
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
