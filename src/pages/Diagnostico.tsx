import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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
};

const QUESTIONS = [
  'O que você vende — e qual problema ele resolve para o seu cliente?',
  'Me descreva a pessoa que mais compra de você. Quem é ela?',
  'Qual é o ticket médio da sua venda? E como o cliente paga — único, recorrente ou parcelado?',
  'Quem são seus principais concorrentes? E por que um cliente escolheria você no lugar deles?',
  'Em qual região ou segmento você quer crescer nos próximos 90 dias?',
  'Você já tentou alguma ação de marketing antes? O que funcionou e o que não funcionou?',
  'Quanto você pode investir por mês em marketing — incluindo ferramenta, mídia e produção?',
  'Quantos clientes novos você precisa fechar por mês para considerar o marketing bem-sucedido?',
  'Em quanto tempo você espera ver os primeiros resultados?',
] as const;

const COMPLETION_LINES = [
  'Analisando seu negócio...',
  'Calculando o que é possível...',
  'Preparando seu diagnóstico...',
] as const;

const extractFirstNumber = (value: string) => {
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const match = normalized.match(/\d{1,3}(?:\.\d{3})*(?:,\d+)?|\d+(?:,\d+)?/);
  if (!match) return null;

  const rawNumber = match[0].replace(/\./g, '').replace(',', '.');
  const parsed = Number(rawNumber);
  if (Number.isNaN(parsed)) return null;

  const milMultiplier = /\bmil\b|k\b/.test(normalized.slice(match.index ?? 0));
  return milMultiplier ? parsed * 1000 : parsed;
};

const extractBillingModel = (value: string) => {
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized.includes('recorrente')) return 'recorrente';
  if (normalized.includes('parcelado')) return 'parcelado';
  if (normalized.includes('unico')) return 'único';

  return null;
};

const extractPrazoEsperado = (value: string) => {
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const directNumber = extractFirstNumber(normalized);
  let prazo = directNumber;

  if (normalized.includes('mes')) {
    prazo = (directNumber ?? 0) * 30;
  }

  if (!prazo) return null;

  const allowed = [30, 60, 90, 180];
  return allowed.reduce((closest, current) =>
    Math.abs(current - prazo) < Math.abs(closest - prazo) ? current : closest,
  );
};

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
  const maxAnswered = Math.max(0, Math.min(record.etapa_atual ?? 0, QUESTIONS.length));
  const history: ConversationItem[] = [];

  for (let index = 0; index < maxAnswered; index += 1) {
    const answer = buildAnswerFromRecord(record, index);
    if (!answer) break;

    history.push({
      question: QUESTIONS[index],
      answer,
    });
  }

  return history;
};

const buildPayloadForStep = (stepIndex: number, answer: string, userId: string) => {
  const stepNumber = stepIndex + 1;

  switch (stepIndex) {
    case 0:
      return { user_id: userId, etapa_atual: stepNumber, produto_desc: answer };
    case 1:
      return { user_id: userId, etapa_atual: stepNumber, icp_desc: answer };
    case 2:
      return {
        user_id: userId,
        etapa_atual: stepNumber,
        ticket_medio: extractFirstNumber(answer),
        modelo_cobranca: extractBillingModel(answer),
      };
    case 3:
      return { user_id: userId, etapa_atual: stepNumber, concorrentes_desc: answer };
    case 4:
      return { user_id: userId, etapa_atual: stepNumber, foco_geografico: answer };
    case 5:
      return { user_id: userId, etapa_atual: stepNumber, historico_marketing: answer };
    case 6:
      return { user_id: userId, etapa_atual: stepNumber, budget_total: extractFirstNumber(answer) };
    case 7:
      return {
        user_id: userId,
        etapa_atual: stepNumber,
        meta_clientes: extractFirstNumber(answer) !== null ? Math.round(extractFirstNumber(answer) as number) : null,
      };
    case 8:
      return { user_id: userId, etapa_atual: stepNumber, prazo_esperado: extractPrazoEsperado(answer) };
    default:
      return { user_id: userId, etapa_atual: stepNumber };
  }
};

const Diagnostico = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [typedQuestion, setTypedQuestion] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [answer, setAnswer] = useState('');
  const [diagnosticoId, setDiagnosticoId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionIndex, setCompletionIndex] = useState(0);
  const shouldRestart = Boolean((location.state as { restart?: boolean } | null)?.restart);

  const activeQuestion = QUESTIONS[currentQuestionIndex] ?? null;
  const progressWidth = `${(conversation.length / QUESTIONS.length) * 100}%`;
  const stepLabel = isCompleting
    ? `${QUESTIONS.length} de ${QUESTIONS.length}`
    : `${Math.min(currentQuestionIndex + 1, QUESTIONS.length)} de ${QUESTIONS.length}`;

  const completionMessage = useMemo(() => COMPLETION_LINES[completionIndex], [completionIndex]);

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
          'id, user_id, etapa_atual, produto_desc, icp_desc, ticket_medio, modelo_cobranca, concorrentes_desc, foco_geografico, historico_marketing, budget_total, meta_clientes, prazo_esperado',
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
        setDiagnosticoId(data.id);
        setLoading(false);
        return;
      }

      if (data) {
        const history = buildConversationHistory(data as DiagnosticoRecord);
        setConversation(history);
        setCurrentQuestionIndex(history.length);
        setDiagnosticoId(data.id);

        if ((data.etapa_atual ?? 0) >= QUESTIONS.length) {
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
    if (loading || isCompleting || !activeQuestion) return;

    setTypedQuestion('');
    setIsTyping(true);

    const speed = activeQuestion.length > 60 ? 14 : 20;
    let timeoutId: number;

    const typeCharacter = (index: number) => {
      setTypedQuestion(activeQuestion.slice(0, index + 1));

      if (index < activeQuestion.length - 1) {
        timeoutId = window.setTimeout(() => typeCharacter(index + 1), speed);
      } else {
        setIsTyping(false);
      }
    };

    timeoutId = window.setTimeout(() => typeCharacter(0), 120);

    return () => window.clearTimeout(timeoutId);
  }, [activeQuestion, isCompleting, loading]);

  useEffect(() => {
    if (!isTyping && !loading && !isCompleting) {
      inputRef.current?.focus();
    }
  }, [isTyping, loading, isCompleting]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [conversation, typedQuestion, isCompleting]);

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
    if (!trimmedAnswer) {
      setShouldShake(true);
      return;
    }

    if (!session?.user || !activeQuestion) return;

    setSaveError('');
    setIsSaving(true);

    const payload = buildPayloadForStep(currentQuestionIndex, trimmedAnswer, session.user.id);

    try {
      if (!diagnosticoId) {
        const { data, error } = await supabase
          .from('diagnostico')
          .insert(payload)
          .select('id')
          .single();

        if (error) throw error;
        setDiagnosticoId(data.id);
      } else {
        const { error } = await supabase.from('diagnostico').update(payload).eq('id', diagnosticoId);
        if (error) throw error;
      }

      setConversation((current) => [...current, { question: activeQuestion, answer: trimmedAnswer }]);
      setAnswer('');

      if (currentQuestionIndex === QUESTIONS.length - 1) {
        setIsCompleting(true);
        setCompletionIndex(0);
      } else {
        window.setTimeout(() => {
          setCurrentQuestionIndex((index) => index + 1);
        }, 500);
      }
    } catch (error) {
      setSaveError('Não foi possível salvar sua resposta agora.');
    } finally {
      setIsSaving(false);
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

      <div
        ref={scrollRef}
        className="h-full overflow-y-auto px-6 pb-44 pt-24 md:px-20 md:pb-48 md:pt-28"
      >
        <div className="mx-auto flex max-w-[560px] flex-col">
          {conversation.map((item, index) => (
            <div key={`${index}-${item.question}`} className="mb-8 last:mb-0">
              <p className="font-display text-[20px] leading-[1.45] text-foreground md:text-[22px]">{item.question}</p>
              <p className="mt-4 max-w-[480px] border-l-[1.5px] border-primary pl-[18px] text-[15px] leading-[1.6] text-[hsl(var(--primary)/0.9)]">
                {item.answer}
              </p>
            </div>
          ))}

          {!isCompleting && activeQuestion && (
            <div className="mb-8">
              <p className="font-display text-[20px] leading-[1.45] text-foreground md:text-[22px]">
                {typedQuestion}
                {isTyping && <span className="ml-1 inline-block h-[18px] w-0.5 animate-cursor bg-primary align-middle" />}
              </p>
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
                disabled={isTyping || isSaving}
                className={`font-display w-full bg-transparent text-[17px] text-foreground caret-primary outline-none ${shouldShake ? 'animate-shake' : ''}`}
              />

              <button
                type="submit"
                disabled={isTyping || isSaving}
                className="rounded-[6px] border border-[hsl(var(--primary)/0.3)] px-4 py-1.5 text-[12px] uppercase tracking-[0.04em] text-primary transition-colors duration-200 hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.08)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98] disabled:opacity-40"
              >
                {isSaving ? '...' : 'enviar'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Diagnostico;