# 🌱 Mi Jardín de Hábitos

App de seguimiento de hábitos con tema de jardín: cada hábito es una planta que crece con tu racha diaria — semilla → brote → plantita → arbusto → floración.

**Producción:** [plant-a-habit.vercel.app](https://plant-a-habit.vercel.app)

## Funcionalidades

- Crear, editar y eliminar hábitos (nombre, color, hora de recordatorio opcional).
- Marcar o desmarcar el cumplimiento del día actual, con respuesta instantánea (actualización optimista).
- Racha de días consecutivos y etapa de crecimiento visual según la racha.
- Mapa de calor del mes actual y % de cumplimiento mensual por hábito.
- Recordatorios mientras la app está abierta: banner in-app y notificación del navegador (si diste permiso).
- Multiusuario: cada persona ve únicamente sus propios hábitos, garantizado por Row Level Security en la base de datos.
- PWA instalable en el celular, con lectura offline básica (la escritura requiere conexión).

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Backend | Supabase (Postgres + Auth con email/contraseña y magic link) |
| Hosting | Vercel |

## Estructura del proyecto

```
app/
  layout.tsx            # Fuentes (Fraunces/Inter/IBM Plex Mono), metadata, PWA
  page.tsx              # Página principal (protegida)
  login/page.tsx        # Entrar / crear cuenta / magic link
  auth/confirm/route.ts # Destino de los enlaces de email de Supabase
  manifest.ts           # Manifest de la PWA
components/             # Garden, HabitCard, HabitModal, LoginForm...
lib/
  habits.ts             # Capa de datos: getHabits, createHabit, updateHabit,
                        # toggleHabitToday, deleteHabit
  dates.ts              # Racha, etapa de crecimiento, % mensual
  supabase/             # Clientes de Supabase (navegador y servidor)
proxy.ts                # Refresca la sesión y protege rutas
supabase/schema.sql     # Esquema de BD + políticas RLS
public/sw.js            # Service worker (lectura offline)
```

## Base de datos

- **`habits`**: `id`, `user_id`, `name`, `color`, `reminder_time`, `created_at`, `updated_at`.
- **`habit_logs`**: `id`, `habit_id`, `user_id`, `log_date` — un registro por hábito y día (`unique(habit_id, log_date)`), con borrado en cascada.

Ambas tablas tienen RLS: todas las políticas comparan `user_id` con `auth.uid()`.

## Desarrollo local

Requisitos: Node.js 20+ y un proyecto de Supabase con el esquema creado (ver [`docs/SETUP.md`](docs/SETUP.md)).

```bash
npm install
cp .env.example .env.local   # pega tu Project URL y anon key de Supabase
npm run dev                  # http://localhost:3000
```

Otros comandos: `npm run build` (build de producción) y `npm run lint`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL del proyecto de Supabase (sin `/rest/v1/`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave `anon public` del proyecto |

No hay claves hardcodeadas; `.env.local` está en `.gitignore`. La anon key es pública por diseño: la protección real de los datos es RLS en Postgres.

## Despliegue

El proyecto se despliega en Vercel con framework preset **Next.js** y las dos variables de entorno de arriba. Cada push a `main` redespliega automáticamente.

La guía completa de configuración desde cero (crear el proyecto de Supabase, ejecutar el SQL, configurar la autenticación y conectar Vercel) está en [`docs/SETUP.md`](docs/SETUP.md).
