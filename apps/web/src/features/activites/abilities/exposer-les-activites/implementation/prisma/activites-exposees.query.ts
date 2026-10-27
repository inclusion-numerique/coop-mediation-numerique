import { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'

export type CriteresDExposition = {
  readonly creeDepuis: Date | undefined
  readonly modifieDepuis: Date | undefined
}

export type CurseurDActivite = {
  readonly modification: string
  readonly id: string
}

const activiteExposeeSelect = {
  id: true,
  type: true,
  suppression: true,
  modification: true,
  creation: true,
  date: true,
  duree: true,
  structureId: true,
  lieuCodePostal: true,
  lieuCommune: true,
  lieuCodeInsee: true,
  mediateurId: true,
  typeLieu: true,
  mediateur: { select: { userId: true } },
  autonomie: true,
  structureDeRedirection: true,
  materiel: true,
  thematiques: true,
  orienteVersStructure: true,
  precisionsDemarche: true,
  titreAtelier: true,
  niveau: true,
  accompagnementsCount: true,
  tags: { select: { tag: { select: { nom: true } } } },
  accompagnements: {
    select: {
      beneficiaire: {
        select: { genre: true, trancheAge: true, statutSocial: true },
      },
    },
  },
} satisfies Prisma.ActiviteSelect

export type ActiviteExposee = Prisma.ActiviteGetPayload<{
  select: typeof activiteExposeeSelect
}>

const apresLeCurseur = (
  curseur: CurseurDActivite | null,
): Prisma.ActiviteWhereInput =>
  curseur === null
    ? {}
    : {
        OR: [
          { modification: { lt: curseur.modification } },
          {
            AND: [
              { modification: curseur.modification },
              { id: { lt: curseur.id } },
            ],
          },
        ],
      }

const exposeesWhere = (
  { creeDepuis, modifieDepuis }: CriteresDExposition,
  curseur: CurseurDActivite | null,
): Prisma.ActiviteWhereInput => ({
  ...(creeDepuis ? { creation: { gte: creeDepuis } } : {}),
  ...(modifieDepuis ? { modification: { gte: modifieDepuis } } : {}),
  ...apresLeCurseur(curseur),
})

const exposeesSql = ({
  creeDepuis,
  modifieDepuis,
}: CriteresDExposition): Prisma.Sql =>
  Prisma.join(
    [
      Prisma.sql`TRUE`,
      ...(creeDepuis ? [Prisma.sql`activites.creation >= ${creeDepuis}`] : []),
      ...(modifieDepuis
        ? [Prisma.sql`activites.modification >= ${modifieDepuis}`]
        : []),
    ],
    ' AND ',
  )

export const activitesExposees = async ({
  criteres,
  take,
  curseur,
}: {
  readonly criteres: CriteresDExposition
  readonly take: number
  readonly curseur: CurseurDActivite | null
}): Promise<{
  readonly activites: readonly ActiviteExposee[]
  readonly total: number
}> => {
  const [activites, comptes] = await Promise.all([
    prismaClient.activite.findMany({
      where: exposeesWhere(criteres, curseur),
      orderBy: [{ modification: 'desc' }, { id: 'desc' }],
      select: activiteExposeeSelect,
      take,
    }),
    prismaClient.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*)::INT AS count FROM activites WHERE ${exposeesSql(criteres)}
    `,
  ])

  return { activites, total: comptes.at(0)?.count ?? 0 }
}
