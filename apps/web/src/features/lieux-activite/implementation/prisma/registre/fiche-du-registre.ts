import {
  Adresse,
  isValidAddress,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Prisma } from '@prisma/client'
import type { Fiche } from '../../../domain/fiche'
import { nonVide, presentationSaisie, urlSaisie } from '../../../domain/saisie'
import * as vocabulaire from '../vocabulaire'
import { contactDuRegistre } from './contact-du-registre'
import { voieDuRegistre } from './voie-du-registre'

export const inscriptionPourLaFiche = {
  select: {
    nom: true,
    nomUsage: true,
    complementAdresse: true,
    visiblePourCartographieNationale: true,
    ficheAccesLibre: true,
    priseRdv: true,
    horaires: true,
    presentationResume: true,
    presentationDetail: true,
    siretALEnrichissement: true,
    structureCartographieNationaleId: true,
    contact: true,
    typologies: true,
    services: true,
    publicsSpecifiquementAdresses: true,
    priseEnChargeSpecifique: true,
    modalitesAcces: true,
    fraisACharge: true,
    itinerance: true,
    dispositifProgrammesNationaux: true,
    formationsLabels: true,
    autresFormationsLabels: true,
    modalitesAccompagnement: true,
    source: true,
    updatedAtCarto: true,
    updatedAtCoop: true,
    updatedAtMin: true,
    adresse: {
      select: {
        codePostal: true,
        codeInsee: true,
        nomCommune: true,
        nomVoie: true,
        numeroVoie: true,
        repetition: true,
        codeBan: true,
      },
    },
  },
} satisfies Prisma.LieuInclusionRegistreMainDefaultArgs

export type InscriptionPourLaFiche = Prisma.LieuInclusionRegistreMainGetPayload<
  typeof inscriptionPourLaFiche
>

export const adresseDeLInscription = (
  inscription: InscriptionPourLaFiche,
): Adresse | null => {
  const { adresse, complementAdresse } = inscription

  if (adresse == null) return null

  const complement = nonVide(complementAdresse)
  const candidate = {
    voie: voieDuRegistre(adresse),
    commune: adresse.nomCommune,
    code_postal: adresse.codePostal,
    code_insee: adresse.codeInsee,
    ...(complement == null ? {} : { complement_adresse: complement }),
  }

  return isValidAddress(candidate) ? Adresse(candidate) : null
}

export const ficheDuRegistre = (
  inscription: InscriptionPourLaFiche,
  depuisLaCoop: Pick<Fiche, 'pivot' | 'localisation' | 'adresse'>,
): Fiche => ({
  nom: Nom(inscription.nom),
  pivot: depuisLaCoop.pivot,
  adresse: adresseDeLInscription(inscription) ?? depuisLaCoop.adresse,
  localisation: depuisLaCoop.localisation,
  typologies: vocabulaire.traduites(
    inscription.typologies,
    vocabulaire.typologie.versStandard,
  ),
  contact: contactDuRegistre(inscription.contact),
  horaires: nonVide(inscription.horaires),
  presentation: presentationSaisie(
    inscription.presentationResume,
    inscription.presentationDetail,
  ),
  services: vocabulaire.traduites(
    inscription.services,
    vocabulaire.service.versStandard,
  ),
  publicsSpecifiquementAdresses: vocabulaire.traduites(
    inscription.publicsSpecifiquementAdresses,
    vocabulaire.publicSpecifiquementAdresse.versStandard,
  ),
  priseEnChargeSpecifique: vocabulaire.traduites(
    inscription.priseEnChargeSpecifique,
    vocabulaire.priseEnChargeSpecifique.versStandard,
  ),
  modalitesAcces: vocabulaire.traduites(
    inscription.modalitesAcces,
    vocabulaire.modaliteAcces.versStandard,
  ),
  fraisACharge: vocabulaire.traduites(
    inscription.fraisACharge,
    vocabulaire.fraisACharge.versStandard,
  ),
  itinerance: vocabulaire.traduites(
    inscription.itinerance,
    vocabulaire.itinerance.versStandard,
  ),
  dispositifProgrammesNationaux: vocabulaire.traduites(
    inscription.dispositifProgrammesNationaux,
    vocabulaire.dispositifProgrammeNational.versStandard,
  ),
  formationsLabels: vocabulaire.traduites(
    inscription.formationsLabels,
    vocabulaire.formationLabel.versStandard,
  ),
  autresFormationsLabels: inscription.autresFormationsLabels,
  modalitesAccompagnement: vocabulaire.traduites(
    inscription.modalitesAccompagnement,
    vocabulaire.modaliteAccompagnement.versStandard,
  ),
  ficheAccesLibre: urlSaisie(inscription.ficheAccesLibre),
  priseRdv: urlSaisie(inscription.priseRdv),
})
