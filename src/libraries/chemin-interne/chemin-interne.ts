import type { Route } from 'next'

const ORIGINE_FICTIVE = 'https://chemin-interne.invalid'

const resoudre = (chemin: string): URL | null => {
  try {
    return new URL(chemin, ORIGINE_FICTIVE)
  } catch {
    return null
  }
}

const cheminResolu = (chemin: string): Route | null => {
  const url = resoudre(chemin)
  return url?.origin === ORIGINE_FICTIVE
    ? (`${url.pathname}${url.search}${url.hash}` as Route)
    : null
}

export const cheminInterne = <T extends string = '/'>(
  chemin: string | null | undefined,
  repli?: Route<T>,
): Route =>
  ((chemin?.startsWith('/') ? cheminResolu(chemin) : null) ??
    repli ??
    '/') as Route
