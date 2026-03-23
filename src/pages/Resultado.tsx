import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  BenchmarkRow,
  calculateLastroScore,
  DiagnosticoScoreRecord,
  LastroCalculation,
  LastroZone,
} from '@/lib/lastro-score';

type ResultadoState = LastroCalculation & {
  diagnosticoId: string;
};

const ZONE_COPY: Record<LastroZone, string> = {
  critico:
    'Há um desalinhamento importante antes de qualquer investimento. Veja o que precisa ser ajustado.',
  ajuste: 'Seu plano tem base — com um ajuste importante antes de avançar.',
  ressalvas: 'Você está no caminho certo. Há um ponto de atenção antes de escalar.',
  pronto: 'Seu diagnóstico está sólido. O caminho está pronto para ser traçado.',
};

const ZONE_COLORS: Record<LastroZone, string> = {
  critico: 'hsl(var(--zone-critical))',
  ajuste: 'hsl(var(--zone-ajuste))',
  ressalvas: 'hsl(var(--zone-ressalvas))',
  pronto: 'hsl(var(--zone-pronto))',
};

const ZONE_LABELS: Record<LastroZone, string> = {
  critico: 'crítico',
  ajuste: 'ajuste necessário',
  ressalvas: 'viável com ressalvas',
  pronto: 'pronto para executar',
};

const dimensionsOrder = (result: LastroCalculation) => [
  { label: 'Viabilidade financeira', value: result.dim1 },
  { label: 'Clareza de ICP', value: result.dim2 },
  { label: 'Alinhamento de prazo', value: result.dim3 },
  { label: 'Maturidade de mercado', value: result.dim4 },
];

const Resultado = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ResultadoState | null>(null);
  const [displayedScore, setDisplayedScore] = useState(0);
  const [typedPhrase, setTypedPhrase] = useState('');
  const [isCounterComplete, setIsCounterComplete] = useState(false);
  const [isPhraseComplete, setIsPhraseComplete] = useState(false);
  const [visibleBars, setVisibleBars] = useState(0);

  const diagnosisPhrase = useMemo(() => (result ? ZONE_COPY[result.zone] : ''), [result]);
  const dimensions = useMemo(() => (result ? dimensionsOrder(result) : []), [result]);

  useEffect(() => {
    let isMounted = true;

    const loadResult = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (!session?.user) {
        navigate('/login');
        return;
      }

      const [diagnosticoResponse, benchmarkResponse] = await Promise.all([
        supabase
          .from('diagnostico')
          .select('id, etapa_atual, produto_desc, icp_desc, concorrentes_desc, budget_total, prazo_esperado')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('cac_benchmark')
          .select('nicho, subnicho, cac_min, cac_max, ciclo_min_dias, ciclo_max_dias')
          .order('nicho', { ascending: true }),
      ]);

      if (!isMounted) return;

      if (diagnosticoResponse.error || benchmarkResponse.error || !diagnosticoResponse.data) {
        navigate('/diagnostico', { replace: true });
        return;
      }

      const diagnostico = diagnosticoResponse.data as DiagnosticoScoreRecord;
      if ((diagnostico.etapa_atual ?? 0) < 9) {
        navigate('/diagnostico', { replace: true });
        return;
      }

      const calculation = calculateLastroScore(diagnostico, (benchmarkResponse.data ?? []) as BenchmarkRow[]);

      const { error: updateError } = await supabase
        .from('diagnostico')
        .update({
          budget_midia: calculation.budgetMidia,
          icp_score: calculation.dim2,
          diferencial_score: calculation.dim4,
          lastro_score: calculation.score,
          zona: calculation.zone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', diagnostico.id);

      if (!isMounted) return;

      if (updateError) {
        navigate('/diagnostico', { replace: true });
        return;
      }

      setResult({ ...calculation, diagnosticoId: diagnostico.id });
      setLoading(false);
    };

    loadResult();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!result) return;

    setDisplayedScore(0);
    setIsCounterComplete(false);

    const duration = 1500;
    const start = performance.now();
    let frameId = 0;

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayedScore(Math.round(result.score * progress));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        setDisplayedScore(result.score);
        setIsCounterComplete(true);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [result]);

  useEffect(() => {
    if (!isCounterComplete || !diagnosisPhrase) return;

    setTypedPhrase('');
    setIsPhraseComplete(false);
    let timeoutId: number;

    const typeCharacter = (index: number) => {
      setTypedPhrase(diagnosisPhrase.slice(0, index + 1));

      if (index < diagnosisPhrase.length - 1) {
        timeoutId = window.setTimeout(() => typeCharacter(index + 1), 18);
      } else {
        setIsPhraseComplete(true);
      }
    };

    timeoutId = window.setTimeout(() => typeCharacter(0), 80);

    return () => window.clearTimeout(timeoutId);
  }, [diagnosisPhrase, isCounterComplete]);

  useEffect(() => {
    if (!isPhraseComplete || !dimensions.length) return;

    setVisibleBars(0);
    const timers = dimensions.map((_, index) =>
      window.setTimeout(() => setVisibleBars(index + 1), index * 150),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [dimensions, isPhraseComplete]);

  if (loading || !result) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 md:px-[60px]">
      <main className="flex w-full max-w-3xl flex-col items-center text-center">
        <section>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[hsl(var(--foreground)/0.3)]">
            Lastro Score
          </p>
          <p
            className="font-display text-[96px] leading-[0.9] md:text-[120px]"
            style={{ color: ZONE_COLORS[result.zone] }}
          >
            {displayedScore}
          </p>
          <p className="mt-2 text-[12px] uppercase tracking-[0.1em] text-[hsl(var(--primary)/0.6)]">
            {ZONE_LABELS[result.zone]}
          </p>
        </section>

        <section className="mt-8 max-w-[440px] min-h-[96px]">
          <p className="font-display text-[20px] italic leading-[1.5] text-foreground">{typedPhrase}</p>
        </section>

        <section className="mt-10 flex w-full max-w-[400px] flex-col gap-3">
          {dimensions.map((dimension, index) => (
            <div key={dimension.label} className="grid grid-cols-[minmax(140px,160px)_1fr_28px] items-center gap-4">
              <p className="text-left text-[12px] tracking-[0.01em] text-[hsl(var(--foreground)/0.35)]">{dimension.label}</p>
              <div className="h-px overflow-hidden bg-[hsl(var(--foreground)/0.08)]">
                <div
                  className="h-full bg-primary transition-[width] duration-[1100ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{ width: index < visibleBars ? `${dimension.value}%` : '0%' }}
                />
              </div>
              <p className="text-[12px] text-[hsl(var(--primary)/0.8)]">{dimension.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 flex max-w-[420px] flex-col items-center">
          {result.zone === 'critico' ? (
            <>
              <p className="text-sm italic leading-[1.7] text-secondary">
                Com esse score, o mapa de GTM ainda não está disponível. Ajuste os pontos abaixo e refaça o diagnóstico.
              </p>
              <button
                onClick={() => navigate('/diagnostico', { state: { restart: true } })}
                className="mt-6 rounded-[8px] border border-[hsl(var(--foreground)/0.12)] px-6 py-3 text-[13px] text-secondary transition-colors duration-200 hover:border-[hsl(var(--foreground)/0.25)] hover:text-[hsl(var(--foreground)/0.7)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98]"
              >
                Refazer diagnóstico
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/plano')}
                className="rounded-[8px] bg-primary px-7 py-3 text-[13px] font-medium tracking-[0.01em] text-primary-foreground transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98]"
              >
                Ver meu mapa de GTM →
              </button>
              <button
                onClick={() => navigate('/diagnostico', { state: { restart: true } })}
                className="mt-3.5 text-[12px] text-[hsl(var(--foreground)/0.25)] transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98]"
              >
                Refazer diagnóstico
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Resultado;