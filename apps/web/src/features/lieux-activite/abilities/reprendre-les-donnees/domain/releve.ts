import type { Anomalie, Gravite } from './anomalie'
import { diagnostiquer } from './diagnostic'
import type { LieuAReprendre } from './lieu-a-reprendre'

export type AnomalieSituee = Anomalie & {
  readonly lieuId: string
  readonly nom: string
  readonly commune: string
  readonly codePostal: string
  readonly publie: boolean
}

export type Poste = {
  readonly code: string
  readonly gravite: Gravite
  readonly lieux: number
  readonly occurrences: number
}

export type Releve = {
  readonly lieuxMesures: number
  readonly lieuxSains: number
  readonly lieuxEcartes: number
  readonly postes: readonly Poste[]
  readonly anomalies: readonly AnomalieSituee[]
}

const situer =
  (lieu: LieuAReprendre) =>
  (anomalie: Anomalie): AnomalieSituee => ({
    ...anomalie,
    lieuId: lieu.id,
    nom: lieu.nom,
    commune: lieu.commune,
    codePostal: lieu.codePostal,
    publie: lieu.publie,
  })

const lieuxDistincts = (anomalies: readonly AnomalieSituee[]): number =>
  new Set(anomalies.map(({ lieuId }) => lieuId)).size

const groupePar = <T>(
  cle: (element: T) => string,
  elements: readonly T[],
): ReadonlyMap<string, readonly T[]> =>
  elements.reduce(
    (groupes, element) =>
      new Map(groupes).set(cle(element), [
        ...(groupes.get(cle(element)) ?? []),
        element,
      ]),
    new Map<string, readonly T[]>(),
  )

export const parCode = <T extends { readonly code: string }>(
  anomalies: readonly T[],
): ReadonlyMap<string, readonly T[]> => groupePar(({ code }) => code, anomalies)

export const parChamp = <T extends { readonly champ: string }>(
  anomalies: readonly T[],
): ReadonlyMap<string, readonly T[]> =>
  groupePar(({ champ }) => champ, anomalies)

export const parLieu = <T extends { readonly lieuId: string }>(
  anomalies: readonly T[],
): ReadonlyMap<string, readonly T[]> =>
  groupePar(({ lieuId }) => lieuId, anomalies)

const posteDe = (
  code: string,
  anomalies: readonly AnomalieSituee[],
): Poste => ({
  code,
  gravite: anomalies[0]?.gravite ?? 'a-verifier',
  lieux: lieuxDistincts(anomalies),
  occurrences: anomalies.length,
})

const duPlusLourd = (gauche: Poste, droite: Poste): number =>
  droite.lieux - gauche.lieux || gauche.code.localeCompare(droite.code)

const ecarteLeLieu = ({ gravite }: AnomalieSituee): boolean =>
  gravite === 'lieu-ecarte'

export const relever = (lieux: readonly LieuAReprendre[]): Releve => {
  const anomalies = lieux.flatMap((lieu) =>
    diagnostiquer(lieu).map(situer(lieu)),
  )

  return {
    lieuxMesures: lieux.length,
    lieuxSains: lieux.length - lieuxDistincts(anomalies),
    lieuxEcartes: lieuxDistincts(anomalies.filter(ecarteLeLieu)),
    postes: [...parCode(anomalies)]
      .map(([code, groupe]) => posteDe(code, groupe))
      .sort(duPlusLourd),
    anomalies,
  }
}
