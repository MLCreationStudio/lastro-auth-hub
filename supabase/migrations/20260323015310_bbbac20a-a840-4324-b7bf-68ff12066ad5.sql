alter table public.diagnostico
  add column if not exists subnicho text,
  add column if not exists categoria text,
  add column if not exists modelo_negocio text,
  add column if not exists canais_testados jsonb,
  add column if not exists tem_historico boolean,
  add column if not exists complementares_usados integer not null default 0;