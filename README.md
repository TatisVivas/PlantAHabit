# 🌱 Mi Jardín de Hábitos

App de seguimiento de hábitos con tema de jardín: cada hábito es una planta que crece con tu racha (semilla → brote → plantita → arbusto → floración).

Construida con **Next.js (App Router) + TypeScript + Tailwind CSS** y **Supabase** (base de datos Postgres + autenticación), lista para desplegar en **Vercel**. Instalable como **PWA** en el celular.

## Funcionalidades

- Crear, editar y eliminar hábitos (nombre, color, hora de recordatorio opcional).
- Marcar/desmarcar el cumplimiento del día actual.
- Racha de días consecutivos, calculada desde los registros en `habit_logs`.
- Etapa de crecimiento visual según la racha.
- Mapa de calor del mes actual y % de cumplimiento mensual por hábito.
- Recordatorios: banner in-app y notificación del navegador (si diste permiso) cuando llega la hora y el hábito no está marcado. Funcionan mientras la app está abierta.
- Multiusuario con Supabase Auth: cada persona ve únicamente sus propios hábitos (garantizado por Row Level Security en la base de datos).
- PWA: instalable en la pantalla de inicio, con lectura offline básica (la escritura requiere conexión).

---

## Paso 0 — Crear las cuentas y proyectos (desde cero)

### 0.1 Crear cuenta y proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y haz clic en **"Start your project"** (o **"Sign in"** arriba a la derecha).
2. Regístrate con **"Continue with GitHub"** (recomendado; si aún no tienes cuenta de GitHub, créala primero en [github.com/signup](https://github.com/signup)).
3. Al entrar por primera vez, Supabase te pedirá crear una **organización** (puedes dejar el nombre sugerido y el plan **Free**).
4. Haz clic en **"New project"** y completa:
   - **Project name**: `mi-jardin-habitos` (o el que prefieras).
   - **Database password**: haz clic en **"Generate a password"** y **guárdala en un lugar seguro** (un gestor de contraseñas). No la necesitas para esta app, pero sí para tareas administrativas futuras. Si la pierdes, se puede resetear en *Project Settings → Database*.
   - **Region**: elige la más cercana a donde vives (por ejemplo, `South America (São Paulo)` si estás en Sudamérica, o `East US` / `West EU` según tu ubicación). Esto reduce la latencia.
5. Haz clic en **"Create new project"** y espera 1–2 minutos a que se aprovisione.

### 0.2 Copiar las claves del proyecto

1. En el dashboard de tu proyecto, ve al menú lateral: **Project Settings** (ícono de engranaje) → **Data API** (o **API Keys**, según la versión del dashboard).
2. Copia estos dos valores (los usarás como variables de entorno):
   - **Project URL** → será `NEXT_PUBLIC_SUPABASE_URL` (algo como `https://abcdefgh.supabase.co`).
   - **anon public** key (en la sección *API Keys*; también puede aparecer como *publishable key*) → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. ⚠️ **Nunca** copies ni uses la clave `service_role` (o *secret key*) en el frontend: esa clave se salta la seguridad de la base de datos.

### 0.3 Crear las tablas (SQL Editor)

1. En el menú lateral del dashboard, haz clic en **SQL Editor**.
2. Haz clic en **"New query"** (o el botón **+**).
3. Abre el archivo [`supabase/schema.sql`](supabase/schema.sql) de este repositorio, copia **todo** su contenido y pégalo en el editor.
4. Haz clic en **"Run"** (o presiona `Ctrl/Cmd + Enter`). Debe decir *"Success. No rows returned"*.
5. Verifica en **Table Editor** (menú lateral) que existen las tablas `habits` y `habit_logs`, ambas con el candado de **RLS enabled**.

### 0.4 Configurar la autenticación

1. En el menú lateral: **Authentication** → **Sign In / Providers**.
2. Verifica que **Email** esté habilitado (viene activo por defecto). Esta app usa **email + contraseña** y también ofrece **magic link** (enlace por correo, sin contraseña) — ambos funcionan con el proveedor Email.
3. Opcional pero recomendado para uso personal: en **Authentication → Sign In / Providers → Email**, puedes desactivar **"Confirm email"** para entrar directo al registrarte, sin esperar el correo de confirmación. Si lo dejas activo, el correo llega con un enlace que ya está soportado por la app (ruta `/auth/confirm`).
4. Cuando tengas tu URL de producción de Vercel (paso 0.6), vuelve a **Authentication → URL Configuration** y:
   - En **Site URL** pon tu URL de producción (ej. `https://mi-jardin-habitos.vercel.app`).
   - En **Redirect URLs** agrega `https://TU-APP.vercel.app/auth/confirm` y `http://localhost:3000/auth/confirm`.

#### Personalizar los correos (plantillas con la estética del jardín)

El repositorio incluye plantillas HTML para los correos de Supabase en [`supabase/email-templates/`](supabase/email-templates/):

1. En el dashboard: **Authentication → Emails** (en algunas versiones aparece como *Email Templates*).
2. Pestaña **"Confirm sign up"**: pega el contenido de `confirm-signup.html` en el campo del cuerpo del mensaje (*Message body*, modo `<> Source`), y en **Subject** pon: `🌱 Confirma tu cuenta — Mi Jardín de Hábitos`. Haz clic en **Save**.
3. Pestaña **"Magic Link"**: pega el contenido de `magic-link.html` y en **Subject** pon: `🌿 Tu enlace mágico — Mi Jardín de Hábitos`. Haz clic en **Save**.

> Las plantillas enlazan a `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`, que es la ruta que esta app usa para verificar el token (recomendado por Supabase para Next.js con SSR). Por eso es importante que **Site URL** esté bien configurada (punto 4 de arriba).

### 0.5 Crear el repositorio en GitHub y subir el código

Si estás leyendo esto, probablemente el código ya está en un repositorio. Si no:

1. Entra a [github.com/new](https://github.com/new).
2. **Repository name**: `mi-jardin-habitos`. Elige **Private** si quieres que solo tú lo veas.
3. NO marques "Add a README" (el proyecto ya tiene uno). Haz clic en **"Create repository"**.
4. En tu computadora, dentro de la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Mi Jardín de Hábitos"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/mi-jardin-habitos.git
git push -u origin main
```

### 0.6 Crear cuenta en Vercel y desplegar

1. Entra a [vercel.com](https://vercel.com) y haz clic en **"Sign Up"**.
2. Elige **"Continue with GitHub"** y autoriza a Vercel (así el despliegue automático queda conectado a tus repos).
3. En el dashboard de Vercel, haz clic en **"Add New…" → "Project"**.
4. En la lista **"Import Git Repository"** busca `mi-jardin-habitos` y haz clic en **"Import"**. (Si no aparece, haz clic en *"Adjust GitHub App Permissions"* y dale acceso al repo.)
5. Vercel detecta Next.js automáticamente; no cambies nada del build. **Antes de hacer clic en Deploy**, abre la sección **"Environment Variables"** y agrega:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | tu *Project URL* del paso 0.2 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tu *anon public key* del paso 0.2 |

6. Haz clic en **"Deploy"** y espera ~1 minuto. Vercel te dará una URL tipo `https://mi-jardin-habitos.vercel.app`.
7. Vuelve al paso 0.4 (punto 4) para registrar esa URL en Supabase.
8. Desde ahora, cada `git push` a `main` redespliega automáticamente.

---

## Desarrollo local

Requisitos: Node.js 20 o superior.

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# edita .env.local y pega tu Project URL y anon key de Supabase

# 3. Levantar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Te redirigirá a `/login`; crea tu cuenta y empieza a plantar hábitos.

> **Importante**: antes del primer uso debes haber ejecutado `supabase/schema.sql` en el SQL Editor de Supabase (paso 0.3). Sin las tablas, la app no puede guardar nada.

Otros comandos:

```bash
npm run build   # build de producción (igual al que corre Vercel)
npm run lint    # linter
```

## Estructura del proyecto

```
app/
  layout.tsx          # Fuentes (Fraunces/Inter/IBM Plex Mono), metadata, PWA
  page.tsx            # Página principal (protegida, redirige a /login sin sesión)
  globals.css         # Identidad visual del jardín (paleta tierra/verdes)
  login/page.tsx      # Entrar / crear cuenta / magic link
  auth/confirm/route.ts # Destino de los enlaces de email de Supabase
  manifest.ts         # Manifest de la PWA
components/
  Garden.tsx          # Vista principal: lista, recordatorios, estado offline
  HabitCard.tsx       # Tarjeta de hábito (racha, etapa, heatmap)
  HabitModal.tsx      # Modal de crear/editar
  LoginForm.tsx       # Formulario de autenticación
lib/
  habits.ts           # Capa de datos: getHabits, createHabit, updateHabit,
                      # toggleHabitToday, deleteHabit (la UI nunca llama a
                      # Supabase directamente)
  dates.ts            # Racha, etapa de crecimiento, % mensual, fechas locales
  supabase/           # Clientes de Supabase (navegador y servidor)
proxy.ts              # Refresca la sesión y protege rutas (Next.js 16 renombró
                      # middleware.ts a proxy.ts)
supabase/schema.sql   # Esquema de BD + políticas RLS (pegar en SQL Editor)
public/sw.js          # Service worker: lectura offline básica
```

## Esquema de base de datos

- **`habits`**: `id`, `user_id` (dueño), `name`, `color` (hex), `reminder_time` (hora opcional), `created_at`, `updated_at`.
- **`habit_logs`**: `id`, `habit_id`, `user_id`, `log_date` (un registro por hábito y día, con restricción `unique(habit_id, log_date)`). Se borra en cascada al eliminar el hábito.

Ambas tablas tienen **Row Level Security**: todas las políticas comparan `user_id` con `auth.uid()`, así que aunque la anon key es pública, cada usuario solo puede leer y modificar sus propias filas.

## Decisiones técnicas (y por qué)

- **Autenticación**: email + contraseña como flujo principal, con **magic link** como alternativa sin contraseña. Para una app personal ambas son suficientes; el magic link es cómodo en el celular pero depende del correo, por eso se ofrecen las dos.
- **Fechas locales, no UTC**: el prototipo usaba `toISOString()`, que cerca de medianoche marca el día equivocado según tu zona horaria. Ahora las fechas (`YYYY-MM-DD`) se calculan con la hora local del dispositivo.
- **Actualización optimista**: marcar/desmarcar el día se refleja al instante en la UI y se revierte si la petición a Supabase falla.
- **`proxy.ts` en vez de `middleware.ts`**: Next.js 16 renombró la convención; cumple el mismo rol (refrescar la sesión de Supabase y redirigir a `/login` si no hay usuario).
- **Recordatorios**: igual que el prototipo, se revisan cada 30 s mientras la app está abierta (banner + Notification API). Las notificaciones push reales con la app cerrada requerirían Web Push + un cron en el servidor; queda fuera de alcance por ahora.
- **PWA con lectura offline**: el service worker cachea la interfaz (network-first para HTML, cache-first para estáticos) y nunca cachea las llamadas a Supabase. Sin conexión puedes ver la app y se muestra un aviso de que no se puede escribir.
- **CSS**: Tailwind v4 está configurado (con la paleta del jardín como tokens del tema), pero la identidad visual del prototipo se conservó tal cual portando su CSS a `globals.css` en lugar de reescribirla en utilidades, para garantizar fidelidad visual 1:1.

## Seguridad

- No hay claves hardcodeadas: todo va por `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- La anon key es pública por diseño; la protección real de los datos es **RLS** en Postgres.
- `.env.local` está en `.gitignore` y nunca se sube al repositorio.
