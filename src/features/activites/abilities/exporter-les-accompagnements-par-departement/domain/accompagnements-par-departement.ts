import type { Departement } from '@app/web/libraries/departement'
import { NombreDAccompagnements } from './nombre-d-accompagnements'

export type AccompagnementsDuDepartement = {
  readonly departement: Departement
  readonly accompagnements: NombreDAccompagnements
}

export type LigneDExport = {
  readonly departement: Departement
  readonly conseillersNumeriques: NombreDAccompagnements
  readonly autresMediateurs: NombreDAccompagnements
}

export const lignesDExport = ({
  conseillersNumeriques,
  autresMediateurs,
}: {
  readonly conseillersNumeriques: readonly AccompagnementsDuDepartement[]
  readonly autresMediateurs: readonly AccompagnementsDuDepartement[]
}): readonly LigneDExport[] =>
  conseillersNumeriques.map(({ departement, accompagnements }) => ({
    departement,
    conseillersNumeriques: accompagnements,
    autresMediateurs:
      autresMediateurs.find(
        (autre) => autre.departement.code === departement.code,
      )?.accompagnements ?? NombreDAccompagnements(0),
  }))
