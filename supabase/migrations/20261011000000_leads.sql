create table leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  creado_en timestamptz not null default now(),
  brevo_sincronizado boolean not null default false
);

create table desbloqueos (
  id bigint generated always as identity primary key,
  lead_id uuid not null references leads(id),
  slug text not null,
  origen text,
  creado_en timestamptz not null default now()
);

create table intentos (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  creado_en timestamptz not null default now()
);

create index intentos_ip_fecha on intentos (ip_hash, creado_en);
create index desbloqueos_slug on desbloqueos (slug);

-- Solo el servidor (service role) escribe y lee. Sin políticas públicas.
alter table leads enable row level security;
alter table desbloqueos enable row level security;
alter table intentos enable row level security;
