// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { SupabaseClient, Session, User } from '@supabase/supabase-js'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>
			session: Session | null
			user: User | null
			og: number | null
			theme: string
		}
		interface PageData {
			session: Session | null;
			theme: string;
			hfzUser?: import('$lib/data/hfzApi').IUser;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
