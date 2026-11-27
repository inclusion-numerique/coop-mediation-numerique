export type PeriodeEmploi =
  | { readonly _tag: 'inconnue' }
  | {
      readonly _tag: 'enCours'
      readonly debut: Date
      readonly finPrevue: Date | null
    }
  | {
      readonly _tag: 'terminee'
      readonly debut: Date | null
      readonly fin: Date
    }

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

  if (debut) {
    return { _tag: 'enCours', debut, finPrevue: terme }
  }

  return { _tag: 'inconnue' }
}

export const couvre = (periode: PeriodeEmploi, date: Date): boolean => {
  if (periode._tag === 'inconnue') return false

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

export const finEmploi = (periode: PeriodeEmploi): Date | null => {
  if (periode._tag === 'inconnue') return null
  return periode._tag === 'terminee' ? periode.fin : periode.finPrevue
}

export const estTerminee = (periode: PeriodeEmploi): boolean =>
  periode._tag === 'terminee'
