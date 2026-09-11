import {
  type Frais,
  ModaliteAcces,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Fiche } from '../../../../domain/fiche'
import { aucuneValeur } from './section-vide'

export type ModalitesAccesAuServiceAffichees = {
  readonly surPlace: boolean
  readonly parTelephone: boolean
  readonly numeroTelephone: string | null
  readonly parMail: boolean
  readonly adresseMail: string | null
  readonly fraisACharge: readonly Frais[]
  readonly estVide: boolean
}

export const modalitesAccesAuService = (
  fiche: Fiche,
): ModalitesAccesAuServiceAffichees => ({
  surPlace: fiche.modalitesAcces.includes(ModaliteAcces.SePresenter),
  parTelephone: fiche.modalitesAcces.includes(ModaliteAcces.Telephoner),
  numeroTelephone: fiche.contact.telephone ?? null,
  parMail: fiche.modalitesAcces.includes(ModaliteAcces.ContacterParMail),
  adresseMail: fiche.contact.courriels?.[0] ?? null,
  fraisACharge: fiche.fraisACharge,
  estVide: aucuneValeur([fiche.modalitesAcces, fiche.fraisACharge]),
})
