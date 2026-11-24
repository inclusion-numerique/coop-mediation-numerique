import {
  Nom,
  Siret,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { Prisma } from '@/generated/prisma/client'
import { toTitleCase } from '@/libraries/texte/to-title-case'
import { LieuId } from '../../../../domain/identifiants/lieu-id'
import { NombreDeLieux } from '../../../../domain/nombres'
import { reconnues } from '../../../../domain/nomenclatures'
import {
  AdresseLibre,
  type SuggestionDeLieu,
} from '../../../../domain/suggestion-de-lieu'
import { lieuExploitable } from '../../../../implementations/prisma/lieu-exploitable.sql'
import type { ChercherDansLaCoop } from '../../domain/ports'

const lieuxDeLaCoop = async (
  recherche: string,
  { limite }: { limite: number },
) => {
  const mots = recherche.split(' ')

  const correspondances = {
    ...lieuExploitable,
    AND: mots.map((mot) => ({
      OR: [
        { siret: { contains: mot, mode: 'insensitive' } },
        { nom: { contains: mot, mode: 'insensitive' } },
        { adresse: { contains: mot, mode: 'insensitive' } },
        { commune: { contains: mot, mode: 'insensitive' } },
      ],
    })),
  } satisfies Prisma.LieuInclusionWhereInput

  const [lignes, matchesCount] = await Promise.all([
    prismaClient.lieuInclusion.findMany({
      where: correspondances,
      take: limite,
      orderBy: { nom: 'asc' },
      select: {
        id: true,
        nom: true,
        adresse: true,
        commune: true,
        codePostal: true,
        codeInsee: true,
        complementAdresse: true,
        siret: true,
        typologies: true,
        latitude: true,
        longitude: true,
      },
    }),
    prismaClient.lieuInclusion.count({ where: correspondances }),
  ])

  return { lignes, matchesCount }
}

type LigneDeLaCoop = Awaited<ReturnType<typeof lieuxDeLaCoop>>['lignes'][number]

const suggestion = (lieu: LigneDeLaCoop): SuggestionDeLieu[] => {
  const nom = Nom.safe(toTitleCase(lieu.nom, { noUpper: true }))
  const adresse = AdresseLibre.safe({
    voie: toTitleCase(lieu.adresse ?? '', { noUpper: true }),
    commune: toTitleCase(lieu.commune ?? ''),
    codePostal: lieu.codePostal ?? '',
    codeInsee: lieu.codeInsee,
    complement: lieu.complementAdresse,
  })

  return nom == null || adresse == null
    ? []
    : [
        {
          provenance: { _tag: 'Coop', lieuId: LieuId(lieu.id) },
          nom,
          adresse,
          siret: Siret.safe(lieu.siret ?? ''),
          typologies: reconnues(Typologie, lieu.typologies ?? []),
        },
      ]
}

export const chercherDansLaCoop: ChercherDansLaCoop = async (
  recherche,
  limite,
) => {
  const { lignes, matchesCount } = await lieuxDeLaCoop(recherche, { limite })

  return {
    suggestions: lignes.flatMap(suggestion),
    nombre: NombreDeLieux(matchesCount),
  }
}
