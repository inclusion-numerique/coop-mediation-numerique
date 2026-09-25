import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'

const DOSSIER_DU_CACHE = 'output/cache-reprise-lieux'

const FICHIER_DU_CACHE = 'reponses.jsonl'

const ATTENTES_AVANT_RELANCE_MS: readonly number[] = [2000, 5000, 10000]

const STATUTS_PASSAGERS = new Set([429, 502, 503, 504])

const STATUTS_MEMORISES = new Set([200, 404])

const STATUTS_SANS_CORPS = new Set([204, 205, 304])

const EntreeDuCache = z.object({ cle: z.string(), valeur: z.unknown() })

const ReponseMemorisee = z.object({ statut: z.number(), corps: z.string() })

type ReponseMemorisee = z.infer<typeof ReponseMemorisee>

type Essai =
  | { readonly issue: 'reponse'; readonly reponse: ReponseMemorisee }
  | { readonly issue: 'coupure'; readonly erreur: TypeError }

const fichierDuCache = (): string =>
  join(process.cwd(), DOSSIER_DU_CACHE, FICHIER_DU_CACHE)

const entreesDuFichier = (): readonly (readonly [string, unknown])[] =>
  existsSync(fichierDuCache())
    ? readFileSync(fichierDuCache(), 'utf8')
        .split('\n')
        .filter((ligne) => ligne !== '')
        .map((ligne) => EntreeDuCache.parse(JSON.parse(ligne)))
        .map(({ cle, valeur }) => [cle, valeur] as const)
    : []

const cache: { entrees: Map<string, unknown> | null } = { entrees: null }

const entrees = (): Map<string, unknown> => {
  cache.entrees ??= new Map(entreesDuFichier())

  return cache.entrees
}

const garder = (cle: string, valeur: unknown): void => {
  mkdirSync(join(process.cwd(), DOSSIER_DU_CACHE), { recursive: true })
  appendFileSync(fichierDuCache(), `${JSON.stringify({ cle, valeur })}\n`)
  entrees().set(cle, valeur)
}

export const memoriser = async <T>(
  cle: string,
  schema: z.ZodType<T>,
  calculer: () => Promise<T>,
  aGarder: (valeur: T) => boolean,
): Promise<T> => {
  const memorisee = entrees().has(cle)
    ? schema.safeParse(entrees().get(cle))
    : null

  if (memorisee?.success) return memorisee.data

  const valeur = await calculer()

  if (aGarder(valeur)) garder(cle, valeur)

  return valeur
}

const pause = (millisecondes: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, millisecondes))

const essayer = async (url: string, init: RequestInit): Promise<Essai> => {
  try {
    const reponse = await fetch(url, init)

    return {
      issue: 'reponse',
      reponse: { statut: reponse.status, corps: await reponse.text() },
    }
  } catch (erreur) {
    if (erreur instanceof TypeError) return { issue: 'coupure', erreur }
    throw erreur
  }
}

const tenter = async (
  url: string,
  init: RequestInit,
  attentes: readonly number[],
): Promise<ReponseMemorisee> => {
  const essai = await essayer(url, init)
  const [attente, ...suivantes] = attentes
  const passager =
    essai.issue === 'coupure' || STATUTS_PASSAGERS.has(essai.reponse.statut)

  if (passager && attente != null) {
    await pause(attente)
    return tenter(url, init, suivantes)
  }
  if (essai.issue === 'coupure') throw essai.erreur

  return essai.reponse
}

const partieEnTexte = async (
  nom: string,
  valeur: FormDataEntryValue,
): Promise<string> =>
  `${nom}=${typeof valeur === 'string' ? valeur : await valeur.text()}`

const corpsEnTexte = async (corps: RequestInit['body']): Promise<string> => {
  if (corps == null) return ''
  if (typeof corps === 'string') return corps
  if (corps instanceof URLSearchParams) return corps.toString()
  if (corps instanceof FormData)
    return (
      await Promise.all(
        [...corps.entries()].map(([nom, valeur]) => partieEnTexte(nom, valeur)),
      )
    ).join('\n')

  throw new Error('Ce corps de requête ne peut pas servir de clé au cache')
}

const cleDeLaRequete = async (
  url: string,
  init: RequestInit,
): Promise<string> =>
  createHash('sha256')
    .update(`${init.method ?? 'GET'} ${url}\n${await corpsEnTexte(init.body)}`)
    .digest('hex')

export const interroger = async (
  url: string,
  init: RequestInit = {},
): Promise<Response> => {
  const { statut, corps } = await memoriser(
    await cleDeLaRequete(url, init),
    ReponseMemorisee,
    () => tenter(url, init, ATTENTES_AVANT_RELANCE_MS),
    (reponse) => STATUTS_MEMORISES.has(reponse.statut),
  )

  return new Response(STATUTS_SANS_CORPS.has(statut) ? null : corps, {
    status: statut,
  })
}
