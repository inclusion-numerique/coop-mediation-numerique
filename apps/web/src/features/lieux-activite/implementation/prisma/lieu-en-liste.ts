import type { Prisma } from '@app/web/generated/prisma/client'
import { nomAffiche } from '@app/web/libraries/nom-affiche'
import { Adresse, Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { NomUsage } from '../../domain/identite-sirene'
import { IdentifiantCartographie } from '../../domain/ids-cartographie-nationale'
import type {
  LieuEnListe,
  ModificationEnListe,
} from '../../domain/lieu-en-liste'
import { LieuId } from '../../domain/lieu-id'
import { NombreDeMediateurs } from '../../domain/nombres'
import { SourceCartographie } from '../../domain/tracabilite'
import { VisibiliteCartographie } from '../../domain/visibilite-cartographie'
import { adresseDeLInscription, inscriptionPourLaFiche } from './registre'
import { derniereModificationExterne } from './registre/modification-du-registre'

export const projectionDuLieuEnListe = {
  id: true,
  nom: true,
  nomUsage: true,
  adresse: true,
  complementAdresse: true,
  commune: true,
  codePostal: true,
  codeInsee: true,
  banId: true,
  modification: true,
  derniereModificationPar: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      email: true,
    },
  },
  derniereModificationSource: true,
  visiblePourCartographieNationale: true,
  inscriptionRegistre: inscriptionPourLaFiche,
  _count: {
    select: {
      mediateursEnActivite: {
        where: {
          suppression: null,
          fin: null,
          mediateur: { user: { deleted: null } },
        },
      },
    },
  },
} satisfies Prisma.LieuInclusionSelect

type LigneEnListe = Prisma.LieuInclusionGetPayload<{
  select: typeof projectionDuLieuEnListe
}>

const adresseDeLaCoop = (ligne: LigneEnListe): Adresse | null =>
  Adresse.safe({
    voie: ligne.adresse,
    commune: ligne.commune,
    code_postal: ligne.codePostal,
    ...(ligne.codeInsee == null || ligne.codeInsee === ''
      ? {}
      : { code_insee: ligne.codeInsee }),
    ...(ligne.complementAdresse == null || ligne.complementAdresse.trim() === ''
      ? {}
      : { complement_adresse: ligne.complementAdresse }),
  })

const sourceDeLaModification = (
  ligne: LigneEnListe,
): SourceCartographie | null => {
  const externe =
    ligne.inscriptionRegistre == null
      ? null
      : derniereModificationExterne(
          ligne.inscriptionRegistre,
          ligne.modification,
        )

  return externe?._tag === 'ParSource'
    ? externe.source
    : SourceCartographie.safe(ligne.derniereModificationSource ?? '')
}

const derniereModification = (ligne: LigneEnListe): ModificationEnListe => {
  const { derniereModificationPar: auteur, modification: date } = ligne

  if (auteur != null)
    return {
      _tag: 'ParUtilisateur',
      date,
      auteur: nomAffiche({
        prenom: auteur.firstName,
        nom: auteur.lastName,
        nomComplet: auteur.name,
        courriel: auteur.email,
      }),
    }

  const source = sourceDeLaModification(ligne)

  return source == null
    ? { _tag: 'Inconnue', date }
    : { _tag: 'ParSource', date, source }
}

export const lieuEnListe = (ligne: LigneEnListe): LieuEnListe => {
  const inscription = ligne.inscriptionRegistre

  return {
    id: LieuId(ligne.id),
    nom: Nom(inscription?.nom ?? ligne.nom),
    nomUsage: NomUsage.safe(inscription?.nomUsage ?? ligne.nomUsage ?? ''),
    adresse:
      (inscription == null ? null : adresseDeLInscription(inscription)) ??
      adresseDeLaCoop(ligne),
    adresseAPreciser: ligne.banId == null,
    derniereModification: derniereModification(ligne),
    visibilite: VisibiliteCartographie(
      ligne.visiblePourCartographieNationale ? 'Publie' : 'NonPublie',
    ),
    identifiantCartographie: IdentifiantCartographie.safe(
      inscription?.structureCartographieNationaleId ?? '',
    ),
    mediateurs: NombreDeMediateurs(ligne._count.mediateursEnActivite),
  }
}
