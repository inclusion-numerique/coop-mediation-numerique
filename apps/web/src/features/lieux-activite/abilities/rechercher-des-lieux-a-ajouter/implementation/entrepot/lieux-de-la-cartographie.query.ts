import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import type { Prisma } from '@app/web/generated/entrepot/client'
import { toTitleCase } from '@app/web/utils/toTitleCase'
import { Nom, Typologie } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { IdentifiantCartographie } from '../../../../domain/ids-cartographie-nationale'
import { LieuId } from '../../../../domain/lieu-id'
import { NombreDeLieux } from '../../../../domain/nombres'
import { reconnues } from '../../../../domain/nomenclatures'
import {
  AdresseLibre,
  type SuggestionDeLieu,
} from '../../../../domain/suggestion-de-lieu'
import type { ChercherDansLaCartographie } from '../../domain/ports'

type AdresseDeLaCartographie = {
  numeroVoie: number | null
  repetition: string | null
  nomVoie: string | null
  nomCommune: string | null
  codePostal: string | null
  codeInsee: string | null
} | null

const voie = (adresse: AdresseDeLaCartographie): string =>
  toTitleCase(
    [
      [adresse?.numeroVoie, adresse?.repetition].filter(Boolean).join(''),
      adresse?.nomVoie,
    ]
      .filter(Boolean)
      .join(' '),
    { noUpper: true },
  )

export const chercherDansLaCartographie: ChercherDansLaCartographie = async (
  recherche,
  { limite, sauf },
) => {
  const correspondances = {
    structureCartographieNationaleId:
      sauf.length > 0 ? { not: null, notIn: [...sauf] } : { not: null },
    adresse: { isNot: null },
    AND: recherche
      .split(' ')
      .filter(Boolean)
      .map((mot) => ({
        OR: [
          { nom: { contains: mot, mode: 'insensitive' } },
          { adresse: { nomVoie: { contains: mot, mode: 'insensitive' } } },
          { adresse: { nomCommune: { contains: mot, mode: 'insensitive' } } },
        ],
      })),
  } satisfies Prisma.LieuInclusionWhereInput

  const [lieux, nombre] = await Promise.all([
    entrepotPrismaClient.lieuInclusion.findMany({
      where: correspondances,
      take: limite,
      orderBy: { nom: 'asc' },
      select: {
        structureCartographieNationaleId: true,
        structureCoopId: true,
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
    }),
    entrepotPrismaClient.lieuInclusion.count({ where: correspondances }),
  ])

  const suggestions = lieux.flatMap((lieu): SuggestionDeLieu[] => {
    const identifiant = IdentifiantCartographie.safe(
      lieu.structureCartographieNationaleId ?? '',
    )
    const nom = Nom.safe(toTitleCase(lieu.nom, { noUpper: true }))
    const adresse = AdresseLibre.safe({
      voie: voie(lieu.adresse),
      commune: toTitleCase(lieu.adresse?.nomCommune ?? ''),
      codePostal: lieu.adresse?.codePostal ?? '',
      codeInsee: lieu.adresse?.codeInsee ?? null,
      complement: null,
    })

    return identifiant == null || nom == null || adresse == null
      ? []
      : [
          {
            provenance: {
              _tag: 'Cartographie',
              identifiant,
              lieuCoop: LieuId.safe(lieu.structureCoopId ?? ''),
            },
            nom,
            adresse,
            siret: null,
            typologies: reconnues(Typologie, lieu.typologies),
          },
        ]
  })

  return { suggestions, nombre: NombreDeLieux(nombre) }
}
