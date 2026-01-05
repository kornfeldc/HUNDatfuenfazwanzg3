import { createServerClient } from '@supabase/ssr'
import { type Handle, redirect } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

const supabase: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_KEY, {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: '/' })
          })
        },
      },
    }
  )

  /**
   * a wrapper function around getSession for use in the hooks handle,
   * as well as in other server-side files.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser()
    
    if (error || !user) {
      return { session: null, user: null }
    }

    // Call getSession ONLY if getUser was successful to satisfy security requirements
    // and provide the session object for cookie syncing.
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()

    return { session, user }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-parse-all-prerender-props'
    },
  })
}

const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession()
  event.locals.session = session
  event.locals.user = user

  if (event.url.pathname === '/l' || event.url.pathname.startsWith('/l/')) {
    if (!session || !user) {
      throw redirect(303, '/login')
    }

    // Check for tenant (og) in the users table
    const { data: userData, error: fetchError } = await event.locals.supabase
      .from('users')
      .select('og')
      .eq('login', user.email)
      .maybeSingle()

    if (fetchError) {
      console.log("------ geht nit ------ ");
      console.error(fetchError);
      console.error('Error fetching user data from public.users:', {
        message: fetchError.message,
        code: fetchError.code,
        details: fetchError.details,
        hint: fetchError.hint,
        userEmail: user.email
      })
    }

    if (!userData || userData.og === null) {
      // If user doesn't exist in users table, create them
      if (!userData && !fetchError) {
        console.log('User not found in public.users, attempting auto-registration:', user.email)
        const { error: insertError } = await event.locals.supabase.from('users').insert({
          login: user.email,
        })
        if (insertError) {
          console.error('Error creating user in public.users:', insertError)
        }
      }

      // If they have no 'og', redirect to no-tenant page
      if (event.url.pathname !== '/no-tenant') {
        throw redirect(303, '/no-tenant')
      }
    } else {
      event.locals.og = userData.og
    }
  }

  return resolve(event)
}

export const handle: Handle = sequence(supabase, authGuard)
