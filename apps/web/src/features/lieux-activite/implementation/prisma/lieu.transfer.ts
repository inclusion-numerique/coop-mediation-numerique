import {
  Adresse,
  Contact,
  Courriel,
  DispositifProgrammesNationaux,
  FicheAccesLibre,
  FormationsLabels,
  FraisACharge,
  Itinerances,
  Localisation,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  Pivot,
  Presentation,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Services,
  Telephone,
  Typologies,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { BanId } from '../../domain/ban-id'
import type { Fiche } from '../../domain/fiche'
import { NomUsage } from '../../domain/identite-sirene'
import { IdsCartographieNationale } from '../../domain/ids-cartographie-nationale'
import type { Lieu } from '../../domain/lieu'
import { LieuId } from '../../domain/lieu-id'
import {
  complementAdresseSaisi,
  horairesDeLaSource,
  labelsLibres,
} from '../../domain/saisie'
import {
  Actif,
  type DerniereModification,
  ModificationInconnue,
  ModifieParSource,
  ModifieParUtilisateur,
  SourceCartographie,
  type Suppression,
  Supprime,
} from '../../domain/tracabilite'
import { UserId } from '../../domain/user-id'
import {
  estPublie,
  VisibiliteCartographie,
} from '../../domain/visibilite-cartographie'
import type { LigneDuLieu, LigneDuLieuCoop } from './ligne-du-lieu'
import { ficheDuRegistre } from './registre/fiche-du-registre'
import { derniereModificationExterne } from './registre/modification-du-registre'
import * as vocabulaire from './vocabulaire'

const nonVide = (valeur: string | null): string | null =>
  valeur != null && valeur.trim() !== '' ? valeur : null

const toSitesWeb = (siteWeb: readonly string[]): readonly Url[] =>
  siteWeb
    .map((adresse) => Url.safe(adresse.trim()))
    .filter((url): url is Url => url != null)

const toCourriels = (courriels: readonly string[]): readonly Courriel[] =>
  courriels
    .map((courriel) => Courriel.safe(courriel))
    .filter((courriel): courriel is Courriel => courriel != null)

const toContact = (row: LigneDuLieuCoop): Contact => {
  const telephone =
    nonVide(row.telephone) == null ? null : Telephone.safe(row.telephone ?? '')
  const sitesWeb = toSitesWeb(row.siteWeb)
  const courriels = toCourriels(row.courriels)

  return Contact({
    ...(telephone == null ? {} : { telephone }),
    ...(courriels.length > 0 ? { courriels: [...courriels] } : {}),
    ...(sitesWeb.length > 0 ? { site_web: [...sitesWeb] } : {}),
  })
}

const toAdresse = (row: LigneDuLieuCoop): Adresse | null => {
  const codeInsee = nonVide(row.codeInsee)
  const complement = complementAdresseSaisi(row.complementAdresse)

  const candidate = {
    voie: row.adresse,
    commune: row.commune,
    code_postal: row.codePostal,
    ...(codeInsee == null ? {} : { code_insee: codeInsee }),
    ...(complement == null ? {} : { complement_adresse: complement }),
  }

  return Adresse.safe(candidate)
}

const toLocalisation = (row: LigneDuLieuCoop): Localisation | null => {
  if (row.latitude == null || row.longitude == null) return null

  const candidate = { latitude: row.latitude, longitude: row.longitude }

  return Localisation.safe(candidate)
}

const toPivot = (row: LigneDuLieuCoop): Pivot | null => {
  const siret = nonVide(row.siret)

  return siret == null ? null : Pivot.safe(siret)
}

const toPresentation = (row: LigneDuLieuCoop): Presentation | null => {
  const resume = nonVide(row.presentationResume)
  const detail = nonVide(row.presentationDetail)

  if (resume == null && detail == null) return null

  return Presentation.safe({
    ...(resume == null ? {} : { resume }),
    ...(detail == null ? {} : { detail }),
  })
}

const toDerniereModificationCoop = (
  row: LigneDuLieuCoop,
): DerniereModification => {
  const source = nonVide(row.derniereModificationSource)
  if (source != null)
    return ModifieParSource(row.modification, SourceCartographie(source))

  return row.derniereModificationParId == null
    ? ModificationInconnue(row.modification)
    : ModifieParUtilisateur(
        row.modification,
        UserId(row.derniereModificationParId),
      )
}

const toDerniereModification = (row: LigneDuLieu): DerniereModification =>
  (row.inscriptionRegistre == null
    ? null
    : derniereModificationExterne(row.inscriptionRegistre, row.modification)) ??
  toDerniereModificationCoop(row)

const toSuppression = (row: LigneDuLieuCoop): Suppression =>
  row.suppression == null
    ? Actif
    : Supprime(
        row.suppression,
        row.suppressionParId == null ? null : UserId(row.suppressionParId),
      )

const toFiche = (row: LigneDuLieuCoop): Fiche => ({
  nom: Nom(row.nom),
  pivot: toPivot(row),
  adresse: toAdresse(row),
  localisation: toLocalisation(row),
  typologies: Typologies(
    vocabulaire.traduites(row.typologies, vocabulaire.typologie.versStandard),
  ),
  contact: toContact(row),
  horaires: horairesDeLaSource(row.horaires),
  presentation: toPresentation(row),
  services: Services(
    vocabulaire.traduites(row.services, vocabulaire.service.versStandard),
  ),
  publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses(
    vocabulaire.traduites(
      row.publicsSpecifiquementAdresses,
      vocabulaire.publicSpecifiquementAdresse.versStandard,
    ),
  ),
  priseEnChargeSpecifique: PrisesEnChargeSpecifiques(
    vocabulaire.traduites(
      row.priseEnChargeSpecifique,
      vocabulaire.priseEnChargeSpecifique.versStandard,
    ),
  ),
  modalitesAcces: ModalitesAcces(
    vocabulaire.traduites(
      row.modalitesAcces,
      vocabulaire.modaliteAcces.versStandard,
    ),
  ),
  fraisACharge: FraisACharge(
    vocabulaire.traduites(
      row.fraisACharge,
      vocabulaire.fraisACharge.versStandard,
    ),
  ),
  itinerance: Itinerances(
    vocabulaire.traduites(row.itinerance, vocabulaire.itinerance.versStandard),
  ),
  dispositifProgrammesNationaux: DispositifProgrammesNationaux(
    vocabulaire.traduites(
      row.dispositifProgrammesNationaux,
      vocabulaire.dispositifProgrammeNational.versStandard,
    ),
  ),
  formationsLabels: FormationsLabels(
    vocabulaire.traduites(
      row.formationsLabels,
      vocabulaire.formationLabel.versStandard,
    ),
  ),
  autresFormationsLabels: labelsLibres(row.autresFormationsLabels),
  modalitesAccompagnement: ModalitesAccompagnement(
    vocabulaire.traduites(
      row.modalitesAccompagnement,
      vocabulaire.modaliteAccompagnement.versStandard,
    ),
  ),
  ficheAccesLibre: FicheAccesLibre.safe(row.ficheAccesLibre ?? ''),
  priseRdv: Url.safe(row.priseRdv ?? ''),
})

const ficheDuLieu = (row: LigneDuLieu) => {
  const coop = toFiche(row)

  return row.inscriptionRegistre == null
    ? coop
    : ficheDuRegistre(row.inscriptionRegistre, {
        pivot: coop.pivot,
        localisation: coop.localisation,
        adresse: coop.adresse,
      })
}

const enveloppe = (row: LigneDuLieuCoop) => ({
  id: LieuId(row.id),
  visibilite: VisibiliteCartographie(
    row.visiblePourCartographieNationale ? 'Publie' : 'NonPublie',
  ),
  idsCartographieNationale: IdsCartographieNationale.safe(
    row.inscriptionRegistre?.structureCartographieNationaleId ?? '',
  ),
  banId: BanId.safe(row.banId ?? ''),
  identiteSirene: {
    nomUsage: NomUsage.safe(row.nomUsage ?? ''),
    synchronisation: row.synchronisationSiret,
  },
  creation: {
    date: row.creation,
    par: row.creationParId == null ? null : UserId(row.creationParId),
  },
})

export const lieuCoopToDomain = (row: LigneDuLieuCoop): Lieu => {
  const { creation, ...reste } = enveloppe(row)

  return {
    ...reste,
    fiche: toFiche(row),
    tracabilite: {
      creation,
      derniereModification: toDerniereModificationCoop(row),
      suppression: toSuppression(row),
    },
  }
}

export const lieuToDomain = (row: LigneDuLieu): Lieu => {
  const { creation, ...reste } = enveloppe(row)

  return {
    ...reste,
    fiche: ficheDuLieu(row),
    tracabilite: {
      creation,
      derniereModification: toDerniereModification(row),
      suppression: toSuppression(row),
    },
  }
}

const versPrisma = <Standard, Prisma>(
  valeurs: readonly Standard[],
  traduction: (valeur: Standard) => Prisma | null,
): Prisma[] =>
  valeurs
    .map(traduction)
    .filter((valeur): valeur is NonNullable<Prisma> => valeur != null)

const fromPivot = (pivot: Pivot | null) => ({
  siret: pivot,
})

export const fromAdresse = (adresse: Adresse | null) => ({
  adresse: adresse?.voie ?? '',
  commune: adresse?.commune ?? '',
  codePostal: adresse?.code_postal ?? '',
  codeInsee: adresse?.code_insee ?? null,
  complementAdresse: adresse?.complement_adresse ?? null,
})

const fromDerniereModification = (modification: DerniereModification) => ({
  modification: modification.date,
  derniereModificationParId:
    modification._tag === 'ParUtilisateur' ? modification.par : null,
  derniereModificationSource:
    modification._tag === 'ParSource' ? modification.source : null,
})

const fromSuppression = (suppression: Suppression) => ({
  suppression: suppression._tag === 'Supprime' ? suppression.date : null,
  suppressionParId: suppression._tag === 'Supprime' ? suppression.par : null,
})

export const lieuFromDomain = ({
  id,
  fiche,
  visibilite,
  idsCartographieNationale,
  banId,
  identiteSirene,
  tracabilite,
}: Lieu) => ({
  id,
  nom: fiche.nom,
  ...fromPivot(fiche.pivot),
  ...fromAdresse(fiche.adresse),
  latitude: fiche.localisation?.latitude ?? null,
  longitude: fiche.localisation?.longitude ?? null,
  banId,
  telephone: fiche.contact.telephone ?? null,
  courriels: [...(fiche.contact.courriels ?? [])],
  siteWeb: [...(fiche.contact.site_web ?? [])],
  horaires: fiche.horaires,
  presentationResume: fiche.presentation?.resume ?? null,
  presentationDetail: fiche.presentation?.detail ?? null,
  ficheAccesLibre: fiche.ficheAccesLibre,
  priseRdv: fiche.priseRdv,
  autresFormationsLabels: [...fiche.autresFormationsLabels],
  typologies: versPrisma(fiche.typologies, vocabulaire.typologie.versCoop),
  services: versPrisma(fiche.services, vocabulaire.service.versCoop),
  publicsSpecifiquementAdresses: versPrisma(
    fiche.publicsSpecifiquementAdresses,
    vocabulaire.publicSpecifiquementAdresse.versCoop,
  ),
  priseEnChargeSpecifique: versPrisma(
    fiche.priseEnChargeSpecifique,
    vocabulaire.priseEnChargeSpecifique.versCoop,
  ),
  modalitesAcces: versPrisma(
    fiche.modalitesAcces,
    vocabulaire.modaliteAcces.versCoop,
  ),
  fraisACharge: versPrisma(
    fiche.fraisACharge,
    vocabulaire.fraisACharge.versCoop,
  ),
  itinerance: versPrisma(fiche.itinerance, vocabulaire.itinerance.versCoop),
  dispositifProgrammesNationaux: versPrisma(
    fiche.dispositifProgrammesNationaux,
    vocabulaire.dispositifProgrammeNational.versCoop,
  ),
  formationsLabels: versPrisma(
    fiche.formationsLabels,
    vocabulaire.formationLabel.versCoop,
  ),
  modalitesAccompagnement: versPrisma(
    fiche.modalitesAccompagnement,
    vocabulaire.modaliteAccompagnement.versCoop,
  ),
  visiblePourCartographieNationale: estPublie(visibilite),
  nomUsage: identiteSirene.nomUsage,
  synchronisationSiret: identiteSirene.synchronisation,
  creation: tracabilite.creation.date,
  creationParId: tracabilite.creation.par,
  ...fromDerniereModification(tracabilite.derniereModification),
  ...fromSuppression(tracabilite.suppression),
})
