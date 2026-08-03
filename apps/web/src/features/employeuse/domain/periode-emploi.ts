/**
 * Période d'emploi d'une personne chez une employeuse.
 *
 * Les dates ne viennent pas de l'affectation (qui ne porte qu'un `est_active`)
 * mais de `main.contrat`, et cette couverture est partielle par construction :
 * environ 53 % des affectations de source `coop` n'ont aucun contrat associé
 * (décision ADR-002 du 23/07 : `est_active` + `contrat` en best-effort). L'état
 * « on ne sait pas » est donc une valeur du domaine à part entière, et non un
 * couple de dates nulles à réinterpréter chez chaque appelant.
 *
 * `terminee` tolère un début absent : un contrat peut porter une date de fin
 * sans date de début.
 */
export type PeriodeEmploi =
  | { readonly _tag: 'inconnue' }
  | { readonly _tag: 'enCours'; readonly debut: Date }
  | {
      readonly _tag: 'terminee'
      readonly debut: Date | null
      readonly fin: Date
    }

/**
 * Construit la période depuis les dates d'un contrat. Une rupture vaut fin :
 * c'est la date qui a effectivement mis un terme à l'emploi.
 */
export const PeriodeEmploi = ({
  debut,
  fin,
  rupture,
}: {
  debut: Date | null
  fin: Date | null
  rupture: Date | null
}): PeriodeEmploi => {
  const terme = fin ?? rupture
  if (terme) return { _tag: 'terminee', debut, fin: terme }
  if (debut) return { _tag: 'enCours', debut }
  return { _tag: 'inconnue' }
}

export const debutEmploi = (periode: PeriodeEmploi): Date | null =>
  periode._tag === 'inconnue' ? null : periode.debut

export const finEmploi = (periode: PeriodeEmploi): Date | null =>
  periode._tag === 'terminee' ? periode.fin : null
