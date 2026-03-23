import { Session } from '@supabase/supabase-js';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { extrairDadosTopico } from '@/lib/anthropic';
import { supabase } from '@/lib/supabase';
import { TOPICOS } from '@/lib/topicos';

type ConversationItem = {
  question: string;
  answer: string;
};

type DiagnosticoRecord = {
  id: string;
  user_id: string | null;
  etapa_atual: number | null;
  produto_desc: string | null;
  icp_desc: string | null;
  ticket_medio: number | null;
  modelo_cobranca: string | null;
  concorrentes_desc: string | null;
  foco_geografico: string | null;
  historico_marketing: string | null;
  budget_total: number | null;
  meta_clientes: number | null;
  prazo_esperado: number | null;
  nicho: string | null;
  subnicho: string | null;
  categoria: string | null;
  modelo_negocio: string | null;
  icp_score: number | null;
  diferencial_score: number | null;
  canais_testados: unknown[] | null;
  tem_historico: boolean | null;
  complementares_usados: number;
};

const COMPLETION_LINES = [
  'Analisando seu negócio...',
  'Calculando o que é possível...',
  'Preparando seu diagnóstico...',
] as const;

const formatCurrency = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return null;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
};

const buildAnswerFromRecord = (record: DiagnosticoRecord, index: number) => {
  switch (index) {
    case 0:
      return record.produto_desc;
    case 1:
      return record.icp_desc;
    case 2: {
      if (record.ticket_medio === null && !record.modelo_cobranca) return null;

      const parts = [
        record.ticket_medio !== null ? `Ticket médio ${formatCurrency(record.ticket_medio)}` : null,
        record.modelo_cobranca ? `pagamento ${record.modelo_cobranca}` : null,
      ].filter(Boolean);

      return parts.join(' · ');
    }
    case 3:
      return record.concorrentes_desc;
    case 4:
      return record.foco_geografico;
    case 5:
      return record.historico_marketing;
    case 6:
      return record.budget_total !== null ? `Investimento mensal de ${formatCurrency(record.budget_total)}` : null;
    case 7:
      return record.meta_clientes !== null ? `${record.meta_clientes} clientes por mês` : null;
    case 8:
      return record.prazo_esperado !== null ? `${record.prazo_esperado} dias` : null;
    default:
      return null;
  }
};

const buildConversationHistory = (record: DiagnosticoRecord) => {
  const maxAnswered = Math.max(0, Math.min(record.etapa_atual ?? 0, TOPICOS.length));
  const history: ConversationItem[] = [];

  for (let index = 0; index < maxAnswered; index += 1) {
    const answer = buildAnswerFromRecord(record, index);
    if (!answer) break;

    history.push({
      question: TOPICOS[index].pergunta_inicial,
      answer,
    });
  }

  return history;
};

const isString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

const Diagnostico = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [typedQuestion, setTypedQuestion] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [answer, setAnswer] = useState('');
  const [diagnosticoId, setDiagnosticoId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionIndex, setCompletionIndex] = useState(0);
  const [complementaresUsados, setComplementaresUsados] = useState(0);
  const [dadosExtraidos, setDadosExtraidos] = useState<Record<string, unknown>>({});
  const [perguntaAtiva, setPerguntaAtiva] = useState(TOPICOS[0].pergunta_inicial);
  const [isPerguntaComplementar, setIsPerguntaComplementar] = useState(false);
  const shouldRestart = Boolean((location.state as { restart?: boolean } | null)?.restart);

  const progressWidth = `${isCompleting ? 100 : (currentQuestionIndex / TOPICOS.length) * 100}%`;
  const stepLabel = isCompleting
    ? `${TOPICOS.length} de ${TOPICOS.length}`
    : `${currentQuestionIndex + 1} de ${TOPICOS.length}`;
  const completionMessage = useMemo(() => COMPLETION_LINES[completionIndex], [completionIndex]);

  const salvarProgresso = async (
    topicoIndex: number,
    resposta: string,
    dados: Record<string, unknown>,
    userId: string,
    complementares: number,
  ) => {
    const payload: Record<string, unknown> = {
      user_id: userId,
      etapa_atual: topicoIndex + 1,
      updated_at: new Date().toISOString(),
      complementares_usados: complementares,
    };

    const camposDiretos = [
      'produto_desc',
      'icp_desc',
      'concorrentes_desc',
      'foco_geografico',
      'historico_marketing',
      'nicho',
      'subnicho',
      'categoria',
      'modelo_negocio',
      'icp_score',
      'diferencial_score',
      'canais_testados',
      'tem_historico',
      'ticket_medio',
      'modelo_cobranca',
      'budget_total',
      'meta_clientes',
      'prazo_esperado',
    ] as const;

    for (const campo of camposDiretos) {
      const valor = dados[campo];
      if (valor !== undefined && valor !== null) {
        payload[campo] = valor;
      }
    }

    if (!payload.produto_desc && isString(dados.produto)) payload.produto_desc = dados.produto;
    if (!payload.icp_desc && isString(dados.perfil)) payload.icp_desc = dados.perfil;

    if (!payload.foco_geografico) {
      const foco = [isString(dados.regiao) ? dados.regiao : null, isString(dados.segmento) ? dados.segmento : null]
        .filter(Boolean)
        .join(' · ');
      if (foco) payload.foco_geografico = foco;
    }

    if (!payload.concorrentes_desc && (isArray(dados.concorrentes) || isString(dados.diferencial))) {
      const concorrentes = isArray(dados.concorrentes)
        ? dados.concorrentes.filter(isString).join(', ')
        : '';
      const diferencial = isString(dados.diferencial) ? dados.diferencial : '';
      const combinado = [concorrentes ? `Concorrentes: ${concorrentes}` : null, diferencial ? `Diferencial: ${diferencial}` : null]
        .filter(Boolean)
        .join(' · ');
      if (combinado) payload.concorrentes_desc = combinado;
    }

    if (!payload.historico_marketing && isBoolean(dados.tem_historico)) {
      payload.historico_marketing = dados.tem_historico
        ? 'Já testou ações de marketing antes.'
        : 'Ainda não testou ações de marketing.';
    }

    const topico = TOPICOS[topicoIndex];
    if (!payload[topico.campo_principal]) {
      payload[topico.campo_principal] = resposta;
    }

    if (!diagnosticoId) {
      const { data, error } = await supabase.from('diagnostico').insert(payload).select('id').single();
      if (error) throw error;
      setDiagnosticoId(data.id);
      return;
    }

    const { error } = await supabase.from('diagnostico').update(payload).eq('id', diagnosticoId);
    if (error) throw error;
  };

  useEffect(() => {
    let isMounted = true;

    const loadDiagnostico = async () => {
      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (!activeSession?.user) {
        navigate('/login');
        return;
      }

      setSession(activeSession);

      const { data, error } = await supabase
        .from('diagnostico')
        .select(
          'id, user_id, etapa_atual, produto_desc, icp_desc, ticket_medio, modelo_cobranca, concorrentes_desc, foco_geografico, historico_marketing, budget_total, meta_clientes, prazo_esperado, nicho, subnicho, categoria, modelo_negocio, icp_score, diferencial_score, canais_testados, tem_historico, complementares_usados',
        )
        .eq('user_id', activeSession.user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        setSaveError('Não foi possível carregar seu diagnóstico.');
        setLoading(false);
        return;
      }

      if (data && shouldRestart) {
        const { error: resetError } = await supabase
          .from('diagnostico')
          .update({
            etapa_atual: 0,
            produto_desc: null,
            icp_desc: null,
            ticket_medio: null,
            modelo_cobranca: null,
            concorrentes_desc: null,
            foco_geografico: null,
            historico_marketing: null,
            budget_total: null,
            meta_clientes: null,
            prazo_esperado: null,
            budget_midia: null,
            icp_score: null,
            diferencial_score: null,
            lastro_score: null,
            zona: null,
            nicho: null,
            subnicho: null,
            categoria: null,
            modelo_negocio: null,
            canais_testados: null,
            tem_historico: null,
            complementares_usados: 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);

        if (resetError) {
          setSaveError('Não foi possível reiniciar seu diagnóstico.');
          setLoading(false);
          return;
        }

        setConversation([]);
        setCurrentQuestionIndex(0);
        setComplementaresUsados(0);
        setPerguntaAtiva(TOPICOS[0].pergunta_inicial);
        setIsPerguntaComplementar(false);
        setDadosExtraidos({});
        setDiagnosticoId(data.id);
        setLoading(false);
        return;
      }

      if (data) {
        const history = buildConversationHistory(data as DiagnosticoRecord);
        setConversation(history);
        setCurrentQuestionIndex(history.length);
        setDiagnosticoId(data.id);
        setComplementaresUsados(data.complementares_usados ?? 0);
        setDadosExtraidos({
          nicho: data.nicho,
          subnicho: data.subnicho,
          categoria: data.categoria,
          modelo_negocio: data.modelo_negocio,
          icp_score: data.icp_score,
          diferencial_score: data.diferencial_score,
          canais_testados: data.canais_testados,
          tem_historico: data.tem_historico,
          ticket_medio: data.ticket_medio,
          modelo_cobranca: data.modelo_cobranca,
          budget_total: data.budget_total,
          meta_clientes: data.meta_clientes,
          prazo_esperado: data.prazo_esperado,
          produto_desc: data.produto_desc,
          icp_desc: data.icp_desc,
          concorrentes_desc: data.concorrentes_desc,
          foco_geografico: data.foco_geografico,
          historico_marketing: data.historico_marketing,
        });

        if (history.length < TOPICOS.length) {
          setPerguntaAtiva(TOPICOS[history.length].pergunta_inicial);
        }

        if ((data.etapa_atual ?? 0) >= TOPICOS.length) {
          navigate('/resultado', { replace: true });
          return;
        }
      }

      setLoading(false);
    };

    loadDiagnostico();

    return () => {
      isMounted = false;
    };
  }, [navigate, shouldRestart]);

  useEffect(() => {
    if (loading || isCompleting || !perguntaAtiva) return;

    setTypedQuestion('');
    setIsTyping(true);

    const speed = perguntaAtiva.length > 60 ? 14 : 20;
    let timeoutId: number;

    const typeCharacter = (index: number) => {
      setTypedQuestion(perguntaAtiva.slice(0, index + 1));

      if (index < perguntaAtiva.length - 1) {
        timeoutId = window.setTimeout(() => typeCharacter(index + 1), speed);
      } else {
        setIsTyping(false);
      }
    };

    timeoutId = window.setTimeout(() => typeCharacter(0), 120);

    return () => window.clearTimeout(timeoutId);
  }, [perguntaAtiva, isCompleting, loading]);

  useEffect(() => {
    if (!isTyping && !loading && !isCompleting && !isProcessingAI) {
      inputRef.current?.focus();
    }
  }, [isTyping, loading, isCompleting, isProcessingAI]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [conversation, typedQuestion, isCompleting, isProcessingAI]);

  useEffect(() => {
    if (!shouldShake) return;

    const timeoutId = window.setTimeout(() => setShouldShake(false), 300);
    return () => window.clearTimeout(timeoutId);
  }, [shouldShake]);

  useEffect(() => {
    if (!isCompleting) return;

    const first = window.setTimeout(() => setCompletionIndex(1), 700);
    const second = window.setTimeout(() => setCompletionIndex(2), 1400);
    const redirect = window.setTimeout(() => navigate('/resultado'), 2000);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
      window.clearTimeout(redirect);
    };
  }, [isCompleting, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer || isProcessingAI) {
      if (!trimmedAnswer) setShouldShake(true);
      return;
    }

    if (!session?.user) return;

    setSaveError('');
    setIsSaving(true);
    setIsProcessingAI(true);

    const topicoAtual = TOPICOS[currentQuestionIndex];

    try {
      const resultado = await extrairDadosTopico(topicoAtual, trimmedAnswer);
      const novosDados = { ...dadosExtraidos, ...resultado };
      const proximoComplementar = complementaresUsados + 1;
      const podePerguntarComplementar =
        !resultado.suficiente &&
        complementaresUsados < topicoAtual.max_complementares &&
        isString(resultado.pergunta_complementar);

      setDadosExtraidos(novosDados);
      setConversation((current) => [...current, { question: perguntaAtiva, answer: trimmedAnswer }]);
      setAnswer('');
      setTypedQuestion('');

      await salvarProgresso(
        currentQuestionIndex,
        trimmedAnswer,
        novosDados,
        session.user.id,
        podePerguntarComplementar ? proximoComplementar : 0,
      );

      if (podePerguntarComplementar) {
        setComplementaresUsados(proximoComplementar);
        setIsPerguntaComplementar(true);
        window.setTimeout(() => {
          setPerguntaAtiva(resultado.pergunta_complementar as string);
        }, 500);
        return;
      }

      setComplementaresUsados(0);
      setIsPerguntaComplementar(false);

      if (currentQuestionIndex === TOPICOS.length - 1) {
        setIsCompleting(true);
        setCompletionIndex(0);
      } else {
        window.setTimeout(() => {
          const proximoTopico = TOPICOS[currentQuestionIndex + 1];
          setPerguntaAtiva(proximoTopico.pergunta_inicial);
          setCurrentQuestionIndex((index) => index + 1);
        }, 500);
      }
    } catch (_error) {
      setSaveError('Não foi possível salvar sua resposta agora.');
    } finally {
      setIsSaving(false);
      setIsProcessingAI(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 h-px bg-[hsl(var(--foreground)/0.06)]">
        <div
          className="h-full bg-primary transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ width: progressWidth }}
        />
      </div>

      <div className="absolute inset-x-0 top-0 z-10 px-6 pt-6 md:px-12">
        <div className="flex items-center justify-between">
          <p className="font-display text-[18px] italic text-primary">Lastro.</p>
          <div className="pointer-events-none text-[11px] tracking-[0.06em] text-[hsl(var(--foreground)/0.25)]">
            {stepLabel}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="h-full overflow-y-auto px-6 pb-44 pt-24 md:px-20 md:pb-48 md:pt-28">
        <div className="mx-auto flex max-w-[560px] flex-col">
          {conversation.map((item, index) => (
            <div key={`${index}-${item.question}`} className="mb-8 last:mb-0">
              <p className="font-display text-[20px] leading-[1.45] text-foreground md:text-[22px]">{item.question}</p>
              <p className="mt-4 max-w-[480px] border-l-[1.5px] border-primary pl-[18px] text-[15px] leading-[1.6] text-[hsl(var(--primary)/0.9)]">
                {item.answer}
              </p>
            </div>
          ))}

          {isPerguntaComplementar && !isProcessingAI && !isCompleting && (
            <p className="mb-2 text-[11px] uppercase tracking-[0.08em] text-[hsl(var(--foreground)/0.2)]">
              detalhe complementar
            </p>
          )}

          {!isCompleting && perguntaAtiva && !isProcessingAI && (
            <div className="mb-8">
              <p className="font-display text-[20px] leading-[1.45] text-foreground md:text-[22px]">
                {typedQuestion}
                {isTyping && <span className="ml-1 inline-block h-[18px] w-0.5 animate-cursor bg-primary align-middle" />}
              </p>
            </div>
          )}

          {isProcessingAI && (
            <div className="mb-8 flex items-center gap-2 text-[18px] tracking-[0.3em] text-[hsl(var(--foreground)/0.3)]">
              <span className="animate-pulse">·</span>
              <span className="animate-pulse [animation-delay:120ms]">·</span>
              <span className="animate-pulse [animation-delay:240ms]">·</span>
            </div>
          )}

          {isCompleting && (
            <div className="flex min-h-[50vh] items-center justify-center">
              <p className="font-display animate-subtle-fade text-center text-[18px] italic text-[hsl(var(--foreground)/0.6)]">
                {completionMessage}
              </p>
            </div>
          )}
        </div>
      </div>

      {!isCompleting && (
        <form
          onSubmit={handleSubmit}
          className="absolute inset-x-0 bottom-0 border-t border-[hsl(var(--foreground)/0.05)] bg-background px-6 pb-8 pt-6 md:px-20"
        >
          <div className="mx-auto max-w-[640px]">
            {saveError && <p className="mb-3 text-sm text-destructive">{saveError}</p>}

            <div className="flex items-center gap-4">
              <input
                ref={inputRef}
                type="text"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="escreva sua resposta..."
                disabled={isTyping || isSaving || isProcessingAI}
                className={`font-display w-full bg-transparent text-[17px] text-foreground caret-primary outline-none ${shouldShake ? 'animate-shake' : ''}`}
              />

              <button
                type="submit"
                disabled={isTyping || isSaving || isProcessingAI}
                className="rounded-[6px] border border-[hsl(var(--primary)/0.3)] px-4 py-1.5 text-[12px] uppercase tracking-[0.04em] text-primary transition-colors duration-200 hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.08)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98] disabled:opacity-40"
              >
                {isSaving || isProcessingAI ? '...' : 'enviar'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Diagnostico;
