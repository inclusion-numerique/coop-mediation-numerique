import {
  type DefinitionDuClientApi,
  finApresDebut,
  MESSAGE_FIN_AVANT_DEBUT,
  NomDuClientApi,
  PorteeApi,
} from '@app/web/features/clients-api/domain'
import { z } from 'zod'

const date = z.iso
  .date('Veuillez renseigner une date valide')
  .transform((jour) => new Date(jour))

export const champsDuClientApi = z.object({
  nom: NomDuClientApi.schema,
  debut: z
    .string()
    .min(1, 'Veuillez renseigner une date de début de validité')
    .pipe(date),
  fin: z
    .string()
    .transform((jour) => (jour === '' ? null : jour))
    .pipe(date.nullable()),
  portees: z
    .array(PorteeApi.schema)
    .min(1, 'Veuillez renseigner au moins une permission'),
})

export const periodeCoherente = {
  verifier: finApresDebut,
  erreur: { message: MESSAGE_FIN_AVANT_DEBUT, path: ['fin'] },
}

export const ClientApiValidation = champsDuClientApi.refine(
  periodeCoherente.verifier,
  periodeCoherente.erreur,
)

export type ValeursDuClientApi = z.input<typeof ClientApiValidation>

export const definitionDepuis = ({
  nom,
  portees,
  debut,
  fin,
}: z.output<typeof champsDuClientApi>): DefinitionDuClientApi => ({
  nom,
  portees,
  validite: { debut, fin },
})
