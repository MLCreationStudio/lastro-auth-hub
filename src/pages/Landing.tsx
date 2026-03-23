import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="flex max-w-3xl flex-col items-center text-center">
        <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-primary">
          <span className="h-px w-6 bg-primary/50" />
          <span>diagnóstico · estratégia · direção</span>
          <span className="h-px w-6 bg-primary/50" />
        </div>

        <h1 className="font-display text-[64px] leading-[0.95] text-foreground md:text-[72px]">
          Lastro<span className="italic text-primary">.</span>
        </h1>

        <p className="mt-4 max-w-[380px] text-base font-light leading-[1.6] text-secondary">
          Marketing com base real. Descubra o que é possível antes de investir um centavo.
        </p>

        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={() => navigate('/cadastro')}
            className="rounded-[8px] bg-primary px-7 py-3 text-[13px] font-medium tracking-[0.01em] text-primary-foreground transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98]"
          >
            iniciar diagnóstico
          </button>
          <button
            onClick={() => navigate('/login')}
            className="rounded-[8px] border border-[hsl(var(--foreground)/0.12)] px-6 py-3 text-[13px] text-secondary transition-colors duration-200 hover:border-[hsl(var(--foreground)/0.25)] hover:text-[hsl(var(--foreground)/0.7)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98]"
          >
            entrar
          </button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {['diagnóstico de viabilidade', 'mapa de gtm', 'direção criativa', 'tracker semanal'].map((item) => (
            <span
              key={item}
              className="rounded-[99px] border border-[hsl(var(--foreground)/0.08)] px-3 py-1 text-[11px] text-[hsl(var(--foreground)/0.3)]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
