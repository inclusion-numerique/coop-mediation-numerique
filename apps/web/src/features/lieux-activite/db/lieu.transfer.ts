import {
  Adresse,
  Contact,
  Courriel,
  isRna,
  isSiret,
  isValidAddress,
  isValidCourriel,
  isValidLocalisation,
  isValidTelephone,
  isValidUrl,
  Localisation,
  Nom,
  type Pivot,
  type Presentation,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuInclusion } from '@prisma/client'
import { BanId } from '../domain/ban-id'
import type { Fiche } from '../domain/fiche'
import { NomUsage } from '../domain/identite-sirene'
import {
  IdsCartographieNationale,
  serialiserIdsCartographieNationale,
} from '../domain/ids-cartographie-nationale'
import type { Lieu } from '../domain/lieu'
import { LieuId } from '../domain/lieu-id'
import {
  Actif,
  type DerniereModification,
  ModificationInconnue,
  ModifieParSource,
  ModifieParUtilisateur,
  SourceCartographie,
  type Suppression,
  Supprime,
} from '../domain/tracabilite'
import { UserId } from '../domain/user-id'
import {
  estPublie,
  VisibiliteCartographie,
} from '../domain/visibilite-cartographie'
import * as vocabulaire from './vocabulaire.transfer'

/** Le séparateur multi-valeurs du schéma national. */
const SEPARATEUR_LISTE = '|'

const nonVide = (valeur: string | null): string | null =>
  valeur != null && valeur.trim() !== '' ? valeur : null

const toSitesWeb = (siteWeb: string | null): readonly Url[] =>
  (siteWeb ?? '')
    .split(SEPARATEUR_LISTE)
    .map((jeton) => jeton.trim())
    .filter(isValidUrl)
    .map(Url)

const toCourriels = (courriels: readonly string[]): readonly Courriel[] =>
  courriels.filter(isValidCourriel).map(Courriel)

const toContact = (row: LieuInclusion): Contact => {
  const telephone = nonVide(row.telephone)
  const sitesWeb = toSitesWeb(row.siteWeb)
  const courriels = toCourriels(row.courriels)

  return Contact({
    ...(telephone != null && isValidTelephone(telephone) ? { telephone } : {}),
    ...(courriels.length > 0 ? { courriels: [...courriels] } : {}),
    ...(sitesWeb.length > 0 ? { site_web: [...sitesWeb] } : {}),
  })
}

const toAdresse = (row: LieuInclusion): Adresse | null => {
  const codeInsee = nonVide(row.codeInsee)
  const complement = nonVide(row.complementAdresse)

  const candidate = {
    voie: row.adresse,
    commune: row.commune,
    code_postal: row.codePostal,
    ...(codeInsee == null ? {} : { code_insee: codeInsee }),
    ...(complement == null ? {} : { complement_adresse: complement }),
  }

  return isValidAddress(candidate) ? Adresse(candidate) : null
}

const toLocalisation = (row: LieuInclusion): Localisation | null => {
  if (row.latitude == null || row.longitude == null) return null

  const candidate = { latitude: row.latitude, longitude: row.longitude }

  return isValidLocalisation(candidate) ? Localisation(candidate) : null
}

const toPivot = (row: LieuInclusion): Pivot | null => {
  const siret = nonVide(row.siret)
  if (siret != null && isSiret(siret)) return siret

  const rna = nonVide(row.rna)

  return rna != null && isRna(rna) ? rna : null
}

const toPresentation = (row: LieuInclusion): Presentation | null => {
  const resume = nonVide(row.presentationResume)
  const detail = nonVide(row.presentationDetail)

  if (resume == null && detail == null) return null

  return {
    ...(resume == null ? {} : { resume }),
    ...(detail == null ? {} : { detail }),
  }
}

const toDerniereModification = (row: LieuInclusion): DerniereModification => {
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

const toSuppression = (row: LieuInclusion): Suppression =>
  row.suppression == null
    ? Actif
    : Supprime(
        row.suppression,
        row.suppressionParId == null ? null : UserId(row.suppressionParId),
      )

const toFiche = (row: LieuInclusion): Fiche => ({
  nom: Nom(row.nom),
  pivot: toPivot(row),
  adresse: toAdresse(row),
  localisation: toLocalisation(row),
  typologies: vocabulaire.traduites(
    row.typologies,
    vocabulaire.typologie.versStandard,
  ),
  contact: toContact(row),
  horaires: nonVide(row.horaires),
  presentation: toPresentation(row),
  services: vocabulaire.traduites(
    row.services,
    vocabulaire.service.versStandard,
  ),
  publicsSpecifiquementAdresses: vocabulaire.traduites(
    row.publicsSpecifiquementAdresses,
    vocabulaire.publicSpecifiquementAdresse.versStandard,
  ),
  priseEnChargeSpecifique: vocabulaire.traduites(
    row.priseEnChargeSpecifique,
    vocabulaire.priseEnChargeSpecifique.versStandard,
  ),
  modalitesAcces: vocabulaire.traduites(
    row.modalitesAcces,
    vocabulaire.modaliteAcces.versStandard,
  ),
  fraisACharge: vocabulaire.traduites(
    row.fraisACharge,
    vocabulaire.fraisACharge.versStandard,
  ),
  itinerance: vocabulaire.traduites(
    row.itinerance,
    vocabulaire.itinerance.versStandard,
  ),
  dispositifProgrammesNationaux: vocabulaire.traduites(
    row.dispositifProgrammesNationaux,
    vocabulaire.dispositifProgrammeNational.versStandard,
  ),
  formationsLabels: vocabulaire.traduites(
    row.formationsLabels,
    vocabulaire.formationLabel.versStandard,
  ),
  autresFormationsLabels: row.autresFormationsLabels,
  modalitesAccompagnement: vocabulaire.traduites(
    row.modalitesAccompagnement,
    vocabulaire.modaliteAccompagnement.versStandard,
  ),
  ficheAccesLibre: isValidUrl(row.ficheAccesLibre ?? '')
    ? Url(row.ficheAccesLibre ?? '')
    : null,
  priseRdv: isValidUrl(row.priseRdv ?? '') ? Url(row.priseRdv ?? '') : null,
})

export const lieuToDomain = (row: LieuInclusion): Lieu => ({
  id: LieuId(row.id),
  fiche: toFiche(row),
  visibilite: VisibiliteCartographie(
    row.visiblePourCartographieNationale ? 'Publie' : 'NonPublie',
  ),
  idsCartographieNationale:
    nonVide(row.structureCartographieNationaleId) == null
      ? null
      : IdsCartographieNationale.safe(
          row.structureCartographieNationaleId ?? '',
        ),
  banId: BanId.safe(row.banId ?? ''),
  identiteSirene: {
    nomUsage: NomUsage.safe(row.nomUsage ?? ''),
    synchronisation: row.synchronisationSiret,
  },
  tracabilite: {
    creation: {
      date: row.creation,
      par: row.creationParId == null ? null : UserId(row.creationParId),
    },
    derniereModification: toDerniereModification(row),
    suppression: toSuppression(row),
  },
})

const versPrisma = <Standard, Prisma>(
  valeurs: readonly Standard[],
  traduction: (valeur: Standard) => Prisma | null,
): Prisma[] =>
  valeurs
    .map(traduction)
    .filter((valeur): valeur is NonNullable<Prisma> => valeur != null)

const fromPivot = (pivot: Pivot | null) => ({
  siret: pivot != null && isSiret(pivot) ? pivot : null,
  rna: pivot != null && isRna(pivot) ? pivot : null,
})

const fromAdresse = (adresse: Adresse | null) => ({
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

/**
 * Les branded types du standard comme ceux de la coop sont structurellement des
 * chaînes : l'assignation vers Prisma est directe, sans `as` ni `!`.
 */
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
  siteWeb:
    fiche.contact.site_web == null || fiche.contact.site_web.length === 0
      ? null
      : fiche.contact.site_web.join(SEPARATEUR_LISTE),
  horaires: fiche.horaires,
  presentationResume: fiche.presentation?.resume ?? null,
  presentationDetail: fiche.presentation?.detail ?? null,
  ficheAccesLibre: fiche.ficheAccesLibre,
  priseRdv: fiche.priseRdv,
  autresFormationsLabels: [...fiche.autresFormationsLabels],
  typologies: versPrisma(fiche.typologies, vocabulaire.typologie.versPrisma),
  services: versPrisma(fiche.services, vocabulaire.service.versPrisma),
  publicsSpecifiquementAdresses: versPrisma(
    fiche.publicsSpecifiquementAdresses,
    vocabulaire.publicSpecifiquementAdresse.versPrisma,
  ),
  priseEnChargeSpecifique: versPrisma(
    fiche.priseEnChargeSpecifique,
    vocabulaire.priseEnChargeSpecifique.versPrisma,
  ),
  modalitesAcces: versPrisma(
    fiche.modalitesAcces,
    vocabulaire.modaliteAcces.versPrisma,
  ),
  fraisACharge: versPrisma(
    fiche.fraisACharge,
    vocabulaire.fraisACharge.versPrisma,
  ),
  itinerance: versPrisma(fiche.itinerance, vocabulaire.itinerance.versPrisma),
  dispositifProgrammesNationaux: versPrisma(
    fiche.dispositifProgrammesNationaux,
    vocabulaire.dispositifProgrammeNational.versPrisma,
  ),
  formationsLabels: versPrisma(
    fiche.formationsLabels,
    vocabulaire.formationLabel.versPrisma,
  ),
  modalitesAccompagnement: versPrisma(
    fiche.modalitesAccompagnement,
    vocabulaire.modaliteAccompagnement.versPrisma,
  ),
  visiblePourCartographieNationale: estPublie(visibilite),
  structureCartographieNationaleId:
    idsCartographieNationale == null
      ? null
      : serialiserIdsCartographieNationale(idsCartographieNationale),
  nomUsage: identiteSirene.nomUsage,
  synchronisationSiret: identiteSirene.synchronisation,
  creation: tracabilite.creation.date,
  creationParId: tracabilite.creation.par,
  ...fromDerniereModification(tracabilite.derniereModification),
  ...fromSuppression(tracabilite.suppression),
})
