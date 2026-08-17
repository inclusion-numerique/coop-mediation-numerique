/**
 * Trace d'une synchronisation, telle que le journal la conserve.
 *
 * `derive` compte les écarts que les webhooks avaient laissé passer : une
 * synchronisation qui en trouve beaucoup signale que les notifications
 * n'arrivent pas, et c'est cela que l'administration surveille.
 */
export type TraceSynchro = {
  readonly debut: Date
  readonly fin: Date | null
  readonly erreur: string | null
  readonly derive: number
}

export type EtatSynchro =
  | { readonly _tag: 'jamaisLancee' }
  | { readonly _tag: 'enCours'; readonly depuis: Date }
  | { readonly _tag: 'echouee'; readonly message: string }
  | {
      readonly _tag: 'avecDerive'
      readonly derive: number
      readonly dureeEnSecondes: number
    }
  | { readonly _tag: 'saine'; readonly dureeEnSecondes: number }

const dureeEnSecondes = (debut: Date, fin: Date): number =>
  Math.round((fin.getTime() - debut.getTime()) / 1000)

/**
 * Lecture de la dernière synchronisation.
 *
 * L'ordre compte : une synchronisation sans fin est en cours, pas échouée — le
 * journal est écrit au démarrage et complété à l'arrivée. Une erreur prime
 * ensuite sur la dérive, celle-ci n'ayant pas de sens quand le passage n'est pas
 * allé à son terme.
 */
export const etatDerniereSynchro = (
  trace: TraceSynchro | null,
): EtatSynchro => {
  if (trace === null) {
    return { _tag: 'jamaisLancee' }
  }

  if (trace.fin === null) {
    return { _tag: 'enCours', depuis: trace.debut }
  }

  if (trace.erreur !== null) {
    return { _tag: 'echouee', message: trace.erreur }
  }

  const duree = dureeEnSecondes(trace.debut, trace.fin)

  return trace.derive > 0
    ? { _tag: 'avecDerive', derive: trace.derive, dureeEnSecondes: duree }
    : { _tag: 'saine', dureeEnSecondes: duree }
}
