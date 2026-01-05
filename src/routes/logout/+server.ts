import { redirect } from '@sveltejs/kit'

export const GET = async ({ locals: { supabase, session } }) => {
  if (session) {
    await supabase.auth.signOut()
  }
  throw redirect(303, '/login')
}
