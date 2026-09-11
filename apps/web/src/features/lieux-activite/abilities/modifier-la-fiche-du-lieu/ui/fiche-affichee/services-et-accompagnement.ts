import type {
  ModaliteAccompagnement,
  Service,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Fiche } from '../../../../domain/fiche'
import { aucuneValeur } from './section-vide'

export type ServicesEtAccompagnementAffiches = {
  readonly services: readonly Service[]
  readonly modalitesAccompagnement: readonly ModaliteAccompagnement[]
  readonly estVide: boolean
}

export const servicesEtAccompagnement = (
  fiche: Fiche,
): ServicesEtAccompagnementAffiches => ({
  services: fiche.services,
  modalitesAccompagnement: fiche.modalitesAccompagnement,
  estVide: aucuneValeur([fiche.services, fiche.modalitesAccompagnement]),
})
