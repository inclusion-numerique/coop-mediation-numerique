import type { Verdict } from './verdict'

/** Ce que la passe a fait, tel que le journal des jobs le conserve. */
export type Compte = {
  readonly examines: number
  readonly verifies: number
  readonly siretsEffaces: number
  readonly ignores: number
  readonly echecs: number
}

export const aucunExamen: Compte = {
  examines: 0,
  verifies: 0,
  siretsEffaces: 0,
  ignores: 0,
  echecs: 0,
}

const enregistrement: Record<Verdict, (compte: Compte) => Compte> = {
  ignore: (compte) => ({ ...compte, ignores: compte.ignores + 1 }),
  verifie: (compte) => ({ ...compte, verifies: compte.verifies + 1 }),
  efface: (compte) => ({ ...compte, siretsEffaces: compte.siretsEffaces + 1 }),
  echec: (compte) => ({ ...compte, echecs: compte.echecs + 1 }),
}

export const compter = (compte: Compte, verdict: Verdict): Compte =>
  enregistrement[verdict]({ ...compte, examines: compte.examines + 1 })
