// Garde-fou partagé contre l'exécution d'un outil destructif contre la PRODUCTION.
// L'hôte n'est PAS un signal fiable (les tunnels prod répondent sur localhost, cf. incident
// 2026-07-08), et un simple motif « prod » non plus : une base de preview nommée d'après la
// branche peut contenir « prod » (ex. `coop-…-fix-fixtures-load-prod-guard`). Le seul signal
// fiable est le NOM EXACT de la base, comparé à une liste de bases de production connues.

// Bases de PRODUCTION connues (match exact, insensible à la casse).
const KNOWN_PRODUCTION_DATABASE_NAMES = ['dataspace_prod']

const databaseNameFromUrl = (databaseUrl: string): string => {
  try {
    return new URL(databaseUrl).pathname.split('/')[1] ?? ''
  } catch {
    return ''
  }
}

const hostFromUrl = (databaseUrl: string): string => {
  try {
    return new URL(databaseUrl).hostname
  } catch {
    return '(hôte inconnu)'
  }
}

export const databaseUrlLooksLikeProduction = (
  databaseUrl: string,
  productionDatabaseName?: string,
): boolean => {
  const target = databaseNameFromUrl(databaseUrl).trim().toLowerCase()
  if (target === '') {
    return false
  }
  const known = [
    ...KNOWN_PRODUCTION_DATABASE_NAMES,
    productionDatabaseName ?? '',
  ]
    .map((name) => name.trim().toLowerCase())
    .filter((name) => name !== '')
  return known.includes(target)
}

// Refuse si la cible ressemble à la production, sauf si `confirmProduction` vaut EXACTEMENT
// le nom de la base cible (le passer force à lire et retaper le nom).
export const assertDatabaseIsNotProduction = ({
  databaseUrl,
  productionDatabaseName,
  confirmProduction,
  action,
}: {
  databaseUrl: string
  productionDatabaseName?: string
  confirmProduction?: string
  action: string
}): void => {
  if (!databaseUrlLooksLikeProduction(databaseUrl, productionDatabaseName)) {
    return
  }

  const target = databaseNameFromUrl(databaseUrl)
  const host = hostFromUrl(databaseUrl)

  if (confirmProduction === target && target !== '') {
    // biome-ignore lint/suspicious/noConsole: garde-fou exécuté en CLI (fixtures/scripts), avertissement volontaire
    console.warn(
      `⚠️  ${action} : cible de PRODUCTION confirmée explicitement (${host}/${target})`,
    )
    return
  }

  throw new Error(
    [
      `Refus : ${action} vise ce qui ressemble à la PRODUCTION (${host}/${target}).`,
      "Si c'est réellement voulu, relancez avec :",
      `  --confirm-production ${target}`,
    ].join('\n'),
  )
}
