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
  | {
      readonly _tag: 'enCours'
      readonly debut: Date
      /** Terme prévu, quand il est connu : un CDD en cours en porte un. */
      readonly finPrevue: Date | null
    }
  | {
      readonly _tag: 'terminee'
      readonly debut: Date | null
      readonly fin: Date
    }

/**
 * Construit la période depuis les dates d'un contrat. Une rupture vaut fin :
 * c'est la date qui a effectivement mis un terme à l'emploi.
 *
 * Le terme est **comparé à la date du jour**, et non simplement constaté. Sans
 * cette comparaison, `terminee` voulait dire « porte une date de fin » : un CDD
 * était donc annoncé terminé dès sa signature, et l'administration affichait
 * « contrat terminé » à des personnes en poste pour encore des mois.
 *
 * Un terme encore devant nous ne clôt rien — il se contente de dater la fin
 * prévue, que `enCours` conserve pour l'affichage comme pour la couverture.
 */
export const PeriodeEmploi = ({
  debut,
  fin,
  rupture,
  maintenant,
}: {
  debut: Date | null
  fin: Date | null
  rupture: Date | null
  maintenant: Date
}): PeriodeEmploi => {
  const terme = fin ?? rupture

  if (terme && terme < maintenant) {
    return { _tag: 'terminee', debut, fin: terme }
  }

  // Un terme sans début connu ne dit pas quand l'emploi a commencé : il ne
  // couvre donc aucune date, et `inconnue` le dit mieux qu'une période bancale.
  if (debut) {
    return { _tag: 'enCours', debut, finPrevue: terme }
  }

  return { _tag: 'inconnue' }
}

/**
 * La période couvre-t-elle cette date ?
 *
 * Une période sans début connu ne couvre rien : on ne peut pas affirmer qu'un
 * emploi avait cours à une date si on ignore quand il a commencé. Une période
 * en cours couvre tout ce qui suit son début.
 */
export const couvre = (periode: PeriodeEmploi, date: Date): boolean => {
  if (periode._tag === 'inconnue') return false

  // Une période en cours est bornée par son terme prévu quand il existe : un CDD
  // qui court jusqu'en novembre ne couvre pas décembre.
  if (periode._tag === 'enCours') {
    return (
      periode.debut <= date &&
      (periode.finPrevue === null || date <= periode.finPrevue)
    )
  }

  return periode.debut !== null && periode.debut <= date && periode.fin >= date
}

export const debutEmploi = (periode: PeriodeEmploi): Date | null =>
  periode._tag === 'inconnue' ? null : periode.debut

/**
 * Date à laquelle l'emploi prend ou a pris fin, qu'elle soit passée ou à venir.
 *
 * Les écrans l'affichent sans se soucier de savoir si elle est échue — c'est
 * `estTerminee` qui porte ce jugement.
 */
export const finEmploi = (periode: PeriodeEmploi): Date | null => {
  if (periode._tag === 'inconnue') return null
  return periode._tag === 'terminee' ? periode.fin : periode.finPrevue
}

/** L'emploi est-il révolu ? Un terme encore à venir ne le rend pas révolu. */
export const estTerminee = (periode: PeriodeEmploi): boolean =>
  periode._tag === 'terminee'
