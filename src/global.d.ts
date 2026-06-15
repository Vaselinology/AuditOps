import 'react-router';
module 'virtual:load-fonts.jsx' {
	export function LoadFonts(): null;
}
declare module 'react-router' {
	interface AppLoadContext {
		// add context properties here
	}
}

declare module 'hono' {
	interface ContextVariableMap {
		requestId: string;
	}
}

declare namespace NodeJS {
  interface ProcessEnv {
    CREATE_TEMP_API_KEY?: string;
    NEXT_PUBLIC_PROJECT_GROUP_ID?: string;
    NEXT_PUBLIC_CREATE_API_BASE_URL?: string;
    VITE_SUPABASE_URL?: string;
    VITE_SUPABASE_ANON_KEY?: string;
    DATABASE_URL?: string;
  }
}
