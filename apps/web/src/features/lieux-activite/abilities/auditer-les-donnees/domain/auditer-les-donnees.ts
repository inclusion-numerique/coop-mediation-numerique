import {
  type Anomalie,
  diagnostiquer,
  type Gravite,
  type LigneAAuditer,
} from './anomalie'

/**
 * Ce que l'audit rend : de quoi décider, pas de quoi lire ligne à ligne.
 *
 * Un poste par code d'anomalie, avec le nombre de lieux touchés — et non le
 * nombre d'anomalies, qu'une même fiche peut multiplier —, plus quelques
 * exemples pour juger sur pièces. Le détail complet part au CSV.
 */
export type Poste = {
  readonly code: string
  readonly gravite: Gravite
  readonly lieux: number
  readonly occurrences: number
  readonly exemples: readonly string[]
}

/**
 * Une anomalie et de quoi reconnaître le lieu qui la porte.
 *
 * Le relevé sert à décider, et on ne décide pas sur un identifiant : il faut
 * savoir de quel lieu il s'agit, où il est, et s'il paraît sur la cartographie
 * — un défaut sur un lieu publié ne pèse pas comme le même sur un lieu qui
 * n'est vu de personne.
 */
export type AnomalieSituee = Anomalie & {
  readonly lieuId: string
  readonly nom: string
  readonly commune: string
  readonly codePostal: string
  readonly publie: boolean
}

export type Releve = {
  readonly lieuxAudites: number
  readonly lieuxSains: number
  readonly lieuxEcartes: number
  readonly postes: readonly Poste[]
  readonly detail: readonly AnomalieSituee[]
}

const EXEMPLES_PAR_POSTE = 3

const trierParPoids = (postes: readonly Poste[]): readonly Poste[] =>
  [...postes].sort(
    (gauche, droite) =>
      droite.lieux - gauche.lieux || gauche.code.localeCompare(droite.code),
  )

/**
 * Le relevé complet.
 *
 * Un lieu « écarté » est un lieu qu'une anomalie bloquante retire de la
 * cartographie : ce n'est pas une fiche diminuée, c'est une fiche qu'on ne sait
 * plus désigner (D21). Les autres anomalies coûtent une valeur, pas le lieu.
 */
export const auditerLesDonnees = (lignes: readonly LigneAAuditer[]): Releve => {
  const detail = lignes.flatMap((ligne) =>
    diagnostiquer(ligne).map((anomalie) => ({
      ...anomalie,
      lieuId: ligne.id,
      nom: ligne.nom,
      commune: ligne.commune,
      codePostal: ligne.codePostal,
      publie: ligne.visiblePourCartographieNationale,
    })),
  )

  const parCode = new Map<
    string,
    {
      gravite: Gravite
      lieux: Set<string>
      occurrences: number
      exemples: string[]
    }
  >()

  for (const anomalie of detail) {
    const poste = parCode.get(anomalie.code) ?? {
      gravite: anomalie.gravite,
      lieux: new Set<string>(),
      occurrences: 0,
      exemples: [],
    }

    poste.lieux.add(anomalie.lieuId)
    poste.occurrences += 1
    if (poste.exemples.length < EXEMPLES_PAR_POSTE && anomalie.valeur !== '')
      poste.exemples.push(`${anomalie.champ} = ${anomalie.valeur}`)

    parCode.set(anomalie.code, poste)
  }

  const lieuxTouches = new Set(detail.map(({ lieuId }) => lieuId))
  const lieuxEcartes = new Set(
    detail
      .filter(({ gravite }) => gravite === 'lieu-ecarte')
      .map(({ lieuId }) => lieuId),
  )

  return {
    lieuxAudites: lignes.length,
    lieuxSains: lignes.length - lieuxTouches.size,
    lieuxEcartes: lieuxEcartes.size,
    postes: trierParPoids(
      [...parCode.entries()].map(([code, poste]) => ({
        code,
        gravite: poste.gravite,
        lieux: poste.lieux.size,
        occurrences: poste.occurrences,
        exemples: poste.exemples,
      })),
    ),
    detail,
  }
}
