import { prismaClient } from '@app/web/prismaClient'
import { acteurSelectForList } from '../mon-reseau/use-cases/acteurs/db/searchActeurs'

export const getLieuActivitePageData = async ({ id }: { id: string }) => {
  const structure = await prismaClient.structure.findUnique({
    where: { id },
    select: {
      id: true,
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
      nom: true,
      adresse: true,
      commune: true,
      codePostal: true,
      complementAdresse: true,
      codeInsee: true,
      latitude: true,
      longitude: true,
      siret: true,
      rna: true,
      typologies: true,
      visiblePourCartographieNationale: true,
      structureCartographieNationaleId: true,
      telephone: true,
      courriels: true,
      itinerance: true,
      fraisACharge: true,
      modalitesAcces: true,
      presentationResume: true,
      presentationDetail: true,
      siteWeb: true,
      horaires: true,
      services: true,
      structureParente: true,
      publicsSpecifiquementAdresses: true,
      priseEnChargeSpecifique: true,
      modalitesAccompagnement: true,
      ficheAccesLibre: true,
      priseRdv: true,
      dispositifProgrammesNationaux: true,
      formationsLabels: true,
      autresFormationsLabels: true,
      mediateursEnActivite: {
        where: {
          suppression: null,
          fin: null,
        },
        select: {
          id: true,
          mediateur: {
            select: {
              user: { select: acteurSelectForList },
              activites: {
                take: 1,
                orderBy: {
                  date: 'desc',
                },
                select: {
                  id: true,
                  date: true,
                },
                where: {
                  structureId: id,
                },
              },
            },
          },
        },
      },
    },
  })
  if (!structure) {
    return null
  }

  return {
    structure: {
      ...structure,
      mediateursEnActivite: structure.mediateursEnActivite.map(
        (mediateurEnActivite) => ({
          ...mediateurEnActivite,
          mediateur: {
            ...mediateurEnActivite.mediateur,
            derniereActivite: {
              date: mediateurEnActivite.mediateur.activites[0]?.date ?? null,
            },
          },
        }),
      ),
    },
  }
}

export type LieuActivitePageData = Exclude<
  Awaited<ReturnType<typeof getLieuActivitePageData>>,
  null
>

export type LieuActivitePageDataMediateurEnActivite =
  LieuActivitePageData['structure']['mediateursEnActivite'][number]
