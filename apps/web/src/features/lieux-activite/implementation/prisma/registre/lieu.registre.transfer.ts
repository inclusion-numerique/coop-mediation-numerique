import type { Contact } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { serialiserIdsCartographieNationale } from '../../../domain/ids-cartographie-nationale'
import type { Lieu } from '../../../domain/lieu'
import { estPublie } from '../../../domain/visibilite-cartographie'
import * as vocabulaire from '../vocabulaire'
import type { LigneDuRegistre } from './ligne-du-registre'

const SEPARATEUR_LISTE = '|'

const nomenclature = <Standard, Colonne>(
  valeurs: readonly Standard[],
  traduction: (valeur: Standard) => Colonne | null,
): Colonne[] => [...vocabulaire.traduites(valeurs, traduction)]

const contactDuRegistre = (contact: Contact) => {
  const courriels = contact.courriels ?? []
  const sitesWeb = contact.site_web ?? []

  return {
    ...(contact.telephone == null ? {} : { telephone: contact.telephone }),
    ...(courriels.length === 0
      ? {}
      : { courriels: { email: courriels.join(SEPARATEUR_LISTE) } }),
    ...(sitesWeb.length === 0
      ? {}
      : { site_web: sitesWeb.join(SEPARATEUR_LISTE) }),
  }
}

const siretDeclare = (lieu: Lieu): string | null => lieu.fiche.pivot

export type ColonnesDuRegistre = Pick<
  LigneDuRegistre,
  | 'nom'
  | 'nomUsage'
  | 'complementAdresse'
  | 'visiblePourCartographieNationale'
  | 'ficheAccesLibre'
  | 'priseRdv'
  | 'horaires'
  | 'presentationResume'
  | 'presentationDetail'
  | 'siretALEnrichissement'
  | 'structureCartographieNationaleId'
  | 'typologies'
  | 'services'
  | 'publicsSpecifiquementAdresses'
  | 'priseEnChargeSpecifique'
  | 'modalitesAcces'
  | 'fraisACharge'
  | 'itinerance'
  | 'formationsLabels'
  | 'modalitesAccompagnement'
> & { readonly contact: ReturnType<typeof contactDuRegistre> }

export const lieuVersRegistre = (lieu: Lieu): ColonnesDuRegistre => {
  const { fiche, visibilite, idsCartographieNationale, identiteSirene } = lieu

  return {
    nom: fiche.nom,
    nomUsage: identiteSirene.nomUsage,
    complementAdresse: fiche.adresse?.complement_adresse ?? null,
    visiblePourCartographieNationale: estPublie(visibilite),
    ficheAccesLibre: fiche.ficheAccesLibre,
    priseRdv: fiche.priseRdv,
    horaires: fiche.horaires,
    presentationResume: fiche.presentation?.resume ?? null,
    presentationDetail: fiche.presentation?.detail ?? null,
    contact: contactDuRegistre(fiche.contact),
    siretALEnrichissement: siretDeclare(lieu),
    structureCartographieNationaleId:
      idsCartographieNationale == null
        ? null
        : serialiserIdsCartographieNationale(idsCartographieNationale),
    typologies: nomenclature(fiche.typologies, vocabulaire.typologie.versCoop),
    services: nomenclature(fiche.services, vocabulaire.service.versCoop),
    publicsSpecifiquementAdresses: nomenclature(
      fiche.publicsSpecifiquementAdresses,
      vocabulaire.publicSpecifiquementAdresse.versCoop,
    ),
    priseEnChargeSpecifique: nomenclature(
      fiche.priseEnChargeSpecifique,
      vocabulaire.priseEnChargeSpecifique.versCoop,
    ),
    modalitesAcces: nomenclature(
      fiche.modalitesAcces,
      vocabulaire.modaliteAcces.versCoop,
    ),
    fraisACharge: nomenclature(
      fiche.fraisACharge,
      vocabulaire.fraisACharge.versCoop,
    ),
    itinerance: nomenclature(fiche.itinerance, vocabulaire.itinerance.versCoop),
    formationsLabels: nomenclature(
      fiche.formationsLabels,
      vocabulaire.formationLabel.versCoop,
    ),
    modalitesAccompagnement: nomenclature(
      fiche.modalitesAccompagnement,
      vocabulaire.modaliteAccompagnement.versCoop,
    ),
  }
}
