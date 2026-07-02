# Guía de configuración desde cero

Cómo dejar funcionando **Mi Jardín de Hábitos** partiendo de cero: cuenta de Supabase, base de datos, autenticación y despliegue en Vercel.

## 1. Crear cuenta y proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y haz clic en **"Start your project"**.
2. Regístrate con **"Continue with GitHub"** (recomendado).
3. Crea la **organización** (plan **Free**) y luego haz clic en **"New project"**:
   - **Project name**: `mi-jardin-habitos` (o el que prefieras).
   - **Database password**: haz clic en **"Generate a password"** y guárdala en un lugar seguro. La app no la usa, pero sirve para tareas administrativas. Si la pierdes, se resetea en *Project Settings → Database*.
   - **Region**: la más cercana a donde vives (menor latencia).
4. Haz clic en **"Create new project"** y espera 1–2 minutos.

## 2. Copiar las claves del proyecto

1. En el dashboard: **Project Settings** (engranaje) → **Data API** / **API Keys**.
2. Copia estos dos valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`. ⚠️ Solo el dominio, por ejemplo `https://abcdefgh.supabase.co` — **sin** el sufijo `/rest/v1/`.
   - Clave **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Nunca uses la clave `service_role` (o *secret key*) en el frontend: se salta la seguridad de la base de datos.

## 3. Crear las tablas (SQL Editor)

1. En el menú lateral: **SQL Editor** → **"New query"**.
2. Copia **todo** el contenido de [`supabase/schema.sql`](../supabase/schema.sql) y pégalo en el editor.
3. Haz clic en **"Run"**. Debe decir *"Success. No rows returned"*. El script es idempotente: se puede ejecutar más de una vez.
4. Verifica en **Table Editor** que existen `habits` y `habit_logs`, ambas con **RLS enabled**.

## 4. Configurar la autenticación

1. **Authentication → Sign In / Providers**: verifica que **Email** esté habilitado (viene activo por defecto). Cubre tanto email + contraseña como magic link.
2. Opcional, recomendado para uso personal: en el proveedor **Email**, desactiva **"Confirm email"** para entrar directo al registrarte. Si lo dejas activo, el correo de confirmación ya está soportado por la app (ruta `/auth/confirm`).
3. Cuando tengas la URL de producción (paso 5), ve a **Authentication → URL Configuration**:
   - **Site URL**: tu URL de producción, ej. `https://plant-a-habit.vercel.app`.
   - **Redirect URLs**: agrega `https://TU-APP.vercel.app/auth/confirm` y `http://localhost:3000/auth/confirm`.
4. **Correos de recuperación / confirmación**: las plantillas por defecto de Supabase funcionan tal cual — la ruta `/auth/confirm` de la app acepta tanto el formato por defecto (`?code=...`) como el de plantillas personalizadas (`?token_hash=...&type=...`). Solo si configuras un **SMTP propio** (Supabase lo exige para editar plantillas) puedes personalizar el diseño de los correos; en ese caso, apunta los enlaces a `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` (y para el de recuperación agrega `&next=/reset-password` con `type=recovery`).

   ⚠️ Importante: los enlaces por defecto redirigen a la URL indicada en `redirect_to`, y Supabase **solo permite URLs que estén en la lista Redirect URLs** (punto 3). Si no están, redirige al Site URL y el flujo puede fallar.

## 5. Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) → **"Sign Up"** → **"Continue with GitHub"**.
2. **"Add New…" → "Project"** → importa este repositorio → **"Import"**.
3. Verifica que **Framework Preset** diga **Next.js**. Si dice "Other" (pasa cuando el repo se importó antes de tener código), cámbialo en *Settings → Build and Deployment → Framework Preset*.
4. Antes de hacer clic en **Deploy**, abre **"Environment Variables"** y agrega:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | tu Project URL del paso 2 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tu anon public key del paso 2 |

5. Haz clic en **"Deploy"**. Vercel te dará una URL tipo `https://mi-jardin-habitos.vercel.app`.
6. Vuelve al paso 4.3 para registrar esa URL en Supabase.
7. Desde ahora, cada `git push` a `main` redespliega automáticamente. Si cambias algo en *Settings*, haz **Redeploy** desde la pestaña *Deployments* para que aplique.

## 6. Probar localmente

```bash
npm install
cp .env.example .env.local   # edita y pega las claves del paso 2
npm run dev                  # http://localhost:3000
```

Te redirigirá a `/login`; crea tu cuenta y empieza a plantar hábitos.
