import {
  CodeInsee,
  CodePostal,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuCandidat } from '@/features/lieux-activite/domain/lieu-identite'
import type { Prisma } from '@/generated/prisma/client'
import { voieDuRegistre } from '../../../domain/registre/voie-du-registre'

export const inscriptionPourLaCorrelation = {
  select: {
    id: true,
    nom: true,
    typologies: true,
    adresse: {
      select: {
        numeroVoie: true,
        repetition: true,
        nomVoie: true,
        nomCommune: true,
        codePostal: true,
        codeInsee: true,
      },
    },
  },
} satisfies Prisma.LieuInclusionRegistreMainDefaultArgs

export type InscriptionPourLaCorrelation =
  Prisma.LieuInclusionRegistreMainGetPayload<
    typeof inscriptionPourLaCorrelation
  >

const coordonneesIllisibles = { latitude: null, longitude: null }

export const candidatDuRegistre = (
  inscription: InscriptionPourLaCorrelation,
): LieuCandidat | null =>
  inscription.adresse == null
    ? null
    : {
        id: `${inscription.id}`,
        nom: inscription.nom,
        adresse: voieDuRegistre(inscription.adresse),
        commune: inscription.adresse.nomCommune,
        codePostal: CodePostal.safe(inscription.adresse.codePostal),
        codeInsee:
          inscription.adresse.codeInsee === null
            ? null
            : CodeInsee.safe(inscription.adresse.codeInsee),
        ...coordonneesIllisibles,
        suppression: null,
        typologies: inscription.typologies,
      }
