import type {
  EffetsApresValidation,
  InscrireALaListeDeDiffusion,
} from '../domain/ports'
import { valider } from '../domain/valider'
import { enregistrerValidation } from './prisma/enregistrer-validation.mutation'
import { lireFaitsInscription } from './prisma/lire-faits-inscription.query'

export const validerAvec = (
  inscrireALaListeDeDiffusion: InscrireALaListeDeDiffusion,
  effetsApresValidation: EffetsApresValidation,
) =>
  valider({
    lireFaitsInscription,
    enregistrerValidation,
    inscrireALaListeDeDiffusion,
    effetsApresValidation,
  })
