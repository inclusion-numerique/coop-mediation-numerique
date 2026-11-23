import { revoquerJetonsBinding } from '../../../implementations/rdv-service-public.bindings'
import { effacerEmpreinteRdvAvec } from './prisma/effacer-empreinte-rdv.mutation'

export { effacerEmpreinteRdvAvec }

export const effacerEmpreinteRdv = effacerEmpreinteRdvAvec(
  revoquerJetonsBinding,
)
