import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, theme }, cookies }) => {
  const { session, user } = await safeGetSession()

  return {
    session,
    user,
    theme,
    cookies: cookies.getAll(),
  }
}
