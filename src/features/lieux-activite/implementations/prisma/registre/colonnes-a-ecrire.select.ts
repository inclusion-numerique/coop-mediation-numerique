import type { EcritureAuRegistre } from '../../../domain/registre/ecriture-au-registre'
import type { ColonnesDuRegistre } from './lieu.transfer'

export type ColonnesAEcrire = (
  toutes: ColonnesDuRegistre,
) => Partial<ColonnesDuRegistre>

export const toutesLesColonnes = (
  toutes: ColonnesDuRegistre,
): ColonnesDuRegistre => toutes

export const identiteDuLieu = ({
  nom,
  nomUsage,
  complementAdresse,
  typologies,
  itinerance,
  siretALEnrichissement,
  visiblePourCartographieNationale,
}: ColonnesDuRegistre): Partial<ColonnesDuRegistre> => ({
  nom,
  nomUsage,
  complementAdresse,
  typologies,
  itinerance,
  siretALEnrichissement,
  visiblePourCartographieNationale,
})

export const colonnesRapporteesParLaCartographie = ({
  nom,
  complementAdresse,
  visiblePourCartographieNationale,
  ficheAccesLibre,
  horaires,
  presentationResume,
  presentationDetail,
  contact,
  typologies,
  services,
  publicsSpecifiquementAdresses,
  priseEnChargeSpecifique,
  modalitesAcces,
  fraisACharge,
  itinerance,
  modalitesAccompagnement,
}: ColonnesDuRegistre): Partial<ColonnesDuRegistre> => ({
  nom,
  complementAdresse,
  visiblePourCartographieNationale,
  ficheAccesLibre,
  horaires,
  presentationResume,
  presentationDetail,
  contact,
  typologies,
  services,
  publicsSpecifiquementAdresses,
  priseEnChargeSpecifique,
  modalitesAcces,
  fraisACharge,
  itinerance,
  modalitesAccompagnement,
})

export const colonnesDeLEcriture: Readonly<
  Record<EcritureAuRegistre, ColonnesAEcrire>
> = {
  FicheComplete: toutesLesColonnes,
  IdentiteSeule: identiteDuLieu,
}
