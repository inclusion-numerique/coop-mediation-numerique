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
import { BanId } from '../../domain/ban-id'
import type { Fiche } from '../../domain/fiche'
import { NomUsage } from '../../domain/identite-sirene'
import { IdsCartographieNationale } from '../../domain/ids-cartographie-nationale'
import type { Lieu } from '../../domain/lieu'
import { LieuId } from '../../domain/lieu-id'
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

const toContact = (row: LigneDuLieuCoop): Contact => {
  const telephone = nonVide(row.telephone)
  const sitesWeb = toSitesWeb(row.siteWeb)
  const courriels = toCourriels(row.courriels)

  return Contact({
    ...(telephone != null && isValidTelephone(telephone) ? { telephone } : {}),
    ...(courriels.length > 0 ? { courriels: [...courriels] } : {}),
    ...(sitesWeb.length > 0 ? { site_web: [...sitesWeb] } : {}),
  })
}

const toAdresse = (row: LigneDuLieuCoop): Adresse | null => {
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

const toLocalisation = (row: LigneDuLieuCoop): Localisation | null => {
  if (row.latitude == null || row.longitude == null) return null

  const candidate = { latitude: row.latitude, longitude: row.longitude }

  return isValidLocalisation(candidate) ? Localisation(candidate) : null
}

const toPivot = (row: LigneDuLieuCoop): Pivot | null => {
  const siret = nonVide(row.siret)
  if (siret != null && isSiret(siret)) return siret

  const rna = nonVide(row.rna)

  return rna != null && isRna(rna) ? rna : null
}

const toPresentation = (row: LigneDuLieuCoop): Presentation | null => {
  const resume = nonVide(row.presentationResume)
  const detail = nonVide(row.presentationDetail)

  if (resume == null && detail == null) return null

  return {
    ...(resume == null ? {} : { resume }),
    ...(detail == null ? {} : { detail }),
  }
}

/**
 * Qui a touché la fiche en dernier.
 *
 * Le registre est interrogé d'abord : c'est lui qui sait qu'une source tierce
 * est passée après nous, et il le sait à l'instant de la lecture plutôt qu'au
 * dernier passage d'un job de nuit. La colonne coop ne sert plus que de repli
 * pour les lieux sans inscription, et garde la mémoire des annotations que ce
 * job avait posées avant sa suppression.
 */
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

/**
 * La fiche du lieu, prise au registre quand il en porte une.
 *
 * Le registre reçoit toutes les écritures — les nôtres comme celles des autres
 * producteurs — et chacun n'y écrit que les colonnes qu'il possède : la fusion
 * champ par champ y a donc déjà eu lieu, et lire cette ligne, c'est lire la
 * valeur la plus récente de chaque champ sans avoir à comparer des dates.
 *
 * Trois choses n'en viennent pas et lui sont passées : le pivot, que le registre
 * ne porte pas — pas de RNA, et `siret_a_l_enrichissement` vide sur les 12 765
 * inscriptions —, les coordonnées, dont la colonne `geom` est illisible par
 * Prisma, et l'adresse en repli quand celle du registre est incomplète.
 */
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

/**
 * Ce que la coop porte autour de la fiche : identité, publication, identifiants
 * et traçabilité. Commun aux deux conversions, qui ne diffèrent que par la
 * provenance de la fiche et de la dernière modification.
 */
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

/**
 * Le lieu tel que la COOP le porte, sans rien emprunter au registre.
 *
 * C'est ce qu'on lui pousse : la fiche que le médiateur vient d'enregistrer, et
 * non celle que le registre affiche déjà.
 */
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
  siret: pivot != null && isSiret(pivot) ? pivot : null,
  rna: pivot != null && isRna(pivot) ? pivot : null,
})

/**
 * Les colonnes d'adresse. Exporté parce que la matérialisation d'un lieu ajouté
 * les compose avec le reste : l'adresse validée prime sur celle de la source,
 * et les deux passent par la même traduction.
 */
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
