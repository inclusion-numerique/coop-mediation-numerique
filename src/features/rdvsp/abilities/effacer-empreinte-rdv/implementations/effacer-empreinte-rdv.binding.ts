import { configurationOAuthRdvsp } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { revoquerJetons } from '@/features/rdvsp/implementations/api/revoquer-jetons.mutation'
import { effacerEmpreinteRdvAvec } from './prisma/effacer-empreinte-rdv.mutation'

export { effacerEmpreinteRdvAvec }

export const effacerEmpreinteRdv = effacerEmpreinteRdvAvec(
  revoquerJetons(configurationOAuthRdvsp()),
)
