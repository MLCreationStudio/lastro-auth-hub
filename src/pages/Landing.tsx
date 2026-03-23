import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <h1
          style={{ fontSize: '64px', fontWeight: 500, fontFamily: 'Georgia, serif' }}
          className="text-primary"
        >
          Lastro
        </h1>
        <p
          style={{ fontSize: '18px', fontFamily: 'Georgia, serif', color: 'rgba(245, 240, 232, 0.6)' }}
          className="italic"
        >
          Marketing com base real.
        </p>
        <div className="flex flex-col items-center gap-3 mt-4">
          <button
            onClick={() => navigate('/cadastro')}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-[6px]"
            style={{ fontFamily: 'Georgia, serif', fontSize: '16px' }}
          >
            Começar diagnóstico
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 rounded-[6px]"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '16px',
              background: 'transparent',
              border: '0.5px solid rgba(245,240,232,0.2)',
              color: 'rgba(245,240,232,0.5)',
            }}
          >
            Já tenho conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
