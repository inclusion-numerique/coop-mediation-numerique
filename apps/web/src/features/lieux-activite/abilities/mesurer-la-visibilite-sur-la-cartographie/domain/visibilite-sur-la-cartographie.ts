import {
  type CodeDepartement,
  type CodeInsee,
  DEPARTEMENT_PAR_DEFAUT,
  departementDeLActeur,
} from '@app/web/libraries/departement'
import { NombreDeLieux } from './nombre-de-lieux'
import type { VisibiliteDuLieu } from './visibilite-du-lieu'

export type LieuDuMediateur = {
  readonly codeInsee: CodeInsee | null
  readonly visibilite: VisibiliteDuLieu
}

export type VisibiliteSurLaCartographie = {
  readonly departement: CodeDepartement
  readonly lieuxVisiblesDuMediateur: NombreDeLieux
  readonly lieuxDuDepartement: NombreDeLieux
}

export const departementDeReference = ({
  employeuse,
  lieux,
}: {
  readonly employeuse: CodeInsee | null
  readonly lieux: readonly LieuDuMediateur[]
}): CodeDepartement =>
  departementDeLActeur({
    employeuse,
    lieux: lieux.flatMap(({ codeInsee }) =>
      codeInsee === null ? [] : [codeInsee],
    ),
  }) ?? DEPARTEMENT_PAR_DEFAUT

export const lieuxVisibles = (
  lieux: readonly LieuDuMediateur[],
): NombreDeLieux =>
  NombreDeLieux(
    lieux.filter(({ visibilite }) => visibilite === 'Visible').length,
  )
