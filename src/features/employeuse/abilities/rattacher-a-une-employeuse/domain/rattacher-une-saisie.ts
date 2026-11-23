import { IdentiteEmployeuse } from '../../../domain/identite-employeuse'
import type { RattacherAUneEmployeuse } from './rattacher-a-une-employeuse'

type SaisieEmployeuse = {
  readonly siret: string
  readonly denomination: string | null
  readonly adresse: {
    readonly voie: string | null
    readonly commune: string
    readonly codePostal: string | null
    readonly codeInsee: string | null
  }
}

export const rattacherUneSaisie =
  (rattacher: RattacherAUneEmployeuse) =>
  async ({
    userId,
    saisie,
  }: {
    userId: string
    saisie: SaisieEmployeuse
  }): ReturnType<RattacherAUneEmployeuse> => {
    const identite = IdentiteEmployeuse.safe(saisie)

    return identite === null
      ? { _tag: 'identiteInexploitable' }
      : rattacher({ userId, identite })
  }
