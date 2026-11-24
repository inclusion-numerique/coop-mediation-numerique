import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Prisma } from '@/generated/prisma/client'
import { nomAffiche } from '@/libraries/nom-affiche'
import { IdentifiantCartographie } from '../../domain/cartographie-nationale/ids-cartographie-nationale'
import { VisibiliteCartographie } from '../../domain/cartographie-nationale/visibilite-cartographie'
import { LieuId } from '../../domain/identifiants/lieu-id'
import { NomUsage } from '../../domain/identite-sirene'
import type {
  LieuEnListe,
  ModificationEnListe,
} from '../../domain/lieu-en-liste'
import { NombreDeMediateurs } from '../../domain/nombres'
import { SourceCartographie } from '../../domain/registre/tracabilite'
import { adresseDesColonnes } from './adresse-des-colonnes.select'
import { adresseDeLInscription, inscriptionPourLaFiche } from './registre'
import { derniereModificationExterne } from './registre/modification-du-registre.transfer'

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
      adresseDesColonnes(ligne),
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
