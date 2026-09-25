import {
  Adresse,
  DispositifProgrammesNationaux,
  FormationsLabels,
  FraisACharge,
  Itinerances,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Services,
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Prisma } from '@prisma/client'
import type { Fiche } from '../../../domain/fiche'
import {
  complementAdresseSaisi,
  ficheAccesLibreSaisie,
  horairesDeLaSource,
  labelsLibres,
  presentationSaisie,
  urlSaisie,
} from '../../../domain/saisie'
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

  const complement = complementAdresseSaisi(complementAdresse)
  const candidate = {
    voie: voieDuRegistre(adresse),
    commune: adresse.nomCommune,
    code_postal: adresse.codePostal,
    code_insee: adresse.codeInsee,
    ...(complement == null ? {} : { complement_adresse: complement }),
  }

  return Adresse.safe(candidate)
}

export const ficheDuRegistre = (
  inscription: InscriptionPourLaFiche,
  depuisLaCoop: Pick<Fiche, 'pivot' | 'localisation' | 'adresse'>,
): Fiche => ({
  nom: Nom(inscription.nom),
  pivot: depuisLaCoop.pivot,
  adresse: adresseDeLInscription(inscription) ?? depuisLaCoop.adresse,
  localisation: depuisLaCoop.localisation,
  typologies: Typologies(
    vocabulaire.traduites(
      inscription.typologies,
      vocabulaire.typologie.versStandard,
    ),
  ),
  contact: contactDuRegistre(inscription.contact),
  horaires: horairesDeLaSource(inscription.horaires),
  presentation: presentationSaisie(
    inscription.presentationResume,
    inscription.presentationDetail,
  ),
  services: Services(
    vocabulaire.traduites(
      inscription.services,
      vocabulaire.service.versStandard,
    ),
  ),
  publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses(
    vocabulaire.traduites(
      inscription.publicsSpecifiquementAdresses,
      vocabulaire.publicSpecifiquementAdresse.versStandard,
    ),
  ),
  priseEnChargeSpecifique: PrisesEnChargeSpecifiques(
    vocabulaire.traduites(
      inscription.priseEnChargeSpecifique,
      vocabulaire.priseEnChargeSpecifique.versStandard,
    ),
  ),
  modalitesAcces: ModalitesAcces(
    vocabulaire.traduites(
      inscription.modalitesAcces,
      vocabulaire.modaliteAcces.versStandard,
    ),
  ),
  fraisACharge: FraisACharge(
    vocabulaire.traduites(
      inscription.fraisACharge,
      vocabulaire.fraisACharge.versStandard,
    ),
  ),
  itinerance: Itinerances(
    vocabulaire.traduites(
      inscription.itinerance,
      vocabulaire.itinerance.versStandard,
    ),
  ),
  dispositifProgrammesNationaux: DispositifProgrammesNationaux(
    vocabulaire.traduites(
      inscription.dispositifProgrammesNationaux,
      vocabulaire.dispositifProgrammeNational.versStandard,
    ),
  ),
  formationsLabels: FormationsLabels(
    vocabulaire.traduites(
      inscription.formationsLabels,
      vocabulaire.formationLabel.versStandard,
    ),
  ),
  autresFormationsLabels: labelsLibres(inscription.autresFormationsLabels),
  modalitesAccompagnement: ModalitesAccompagnement(
    vocabulaire.traduites(
      inscription.modalitesAccompagnement,
      vocabulaire.modaliteAccompagnement.versStandard,
    ),
  ),
  ficheAccesLibre: ficheAccesLibreSaisie(inscription.ficheAccesLibre),
  priseRdv: urlSaisie(inscription.priseRdv),
})
