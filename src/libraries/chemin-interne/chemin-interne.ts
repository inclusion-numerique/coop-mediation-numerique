const ORIGINE_FICTIVE = 'https://chemin-interne.invalid'

const resoudre = (chemin: string): URL | null => {
  try {
    return new URL(chemin, ORIGINE_FICTIVE)
  } catch {
    return null
  }
}

const cheminResolu = (chemin: string): string | null => {
  const url = resoudre(chemin)
  return url?.origin === ORIGINE_FICTIVE
    ? `${url.pathname}${url.search}${url.hash}`
    : null
}

export const cheminInterne = (
  chemin: string | null | undefined,
  repli = '/',
): string => (chemin?.startsWith('/') ? (cheminResolu(chemin) ?? repli) : repli)
