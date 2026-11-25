import { prismaClient } from '@/configuration/prisma'
import { type MediateurId, NomDeTag, TagId } from '../../../../domain'

const TAGS_LES_PLUS_UTILISES = 10

const employeusesDesActivites = async (
  mediateurId: MediateurId,
): Promise<readonly number[]> =>
  (
    await prismaClient.$queryRaw<{ id: number }[]>`
      SELECT DISTINCT act.structure_employeuse_main_id AS id
      FROM activites act
      WHERE act.mediateur_id = ${mediateurId}::uuid
        AND act.suppression IS NULL
        AND act.structure_employeuse_main_id IS NOT NULL`
  ).map(({ id }) => id)

export const optionsDeFiltreDesActivites = async ({
  mediateurId,
}: {
  readonly mediateurId: MediateurId
}) => {
  const [bornes, idsDEmployeuses, tags, importV1, uneActivite] =
    await Promise.all([
      prismaClient.activite.aggregate({
        _min: { date: true },
        _max: { date: true },
        where: { mediateurId, suppression: null },
      }),
      employeusesDesActivites(mediateurId),
      prismaClient.tag.findMany({
        where: {
          suppression: null,
          activites: {
            some: { activite: { mediateurId, suppression: null } },
          },
        },
        select: {
          id: true,
          nom: true,
        },
        orderBy: [{ activites: { _count: 'desc' } }, { nom: 'asc' }],
        take: TAGS_LES_PLUS_UTILISES,
      }),
      prismaClient.activite.findFirst({
        where: { mediateurId, suppression: null, v1CraId: { not: null } },
        select: { id: true },
      }),
      prismaClient.activite.findFirst({
        where: { mediateurId, suppression: null },
        select: { id: true },
      }),
    ])
  const employeuses = await prismaClient.structureAdministrativeMain.findMany({
    where: { id: { in: [...idsDEmployeuses] } },
    select: {
      id: true,
      denominationAntenne: true,
      denominationSirene: true,
      adresse: { select: { nomCommune: true } },
    },
    orderBy: { denominationAntenne: 'asc' },
  })
  return {
    periodeCouverte: {
      ...(bornes._min.date === null ? {} : { first: bornes._min.date }),
      ...(bornes._max.date === null ? {} : { last: bornes._max.date }),
    },
    employeuses: employeuses.map((structure) => ({
      id: String(structure.id),
      nom: structure.denominationAntenne ?? structure.denominationSirene ?? '',
      commune: structure.adresse?.nomCommune ?? null,
    })),
    tags: tags.flatMap((tag) => {
      const nom = NomDeTag.safe(tag.nom)
      return nom === null ? [] : [{ id: TagId(tag.id), nom }]
    }),
    importsV1: importV1 !== null,
    aDesActivites: uneActivite !== null,
  }
}

export type OptionsDeFiltreDesActivites = Awaited<
  ReturnType<typeof optionsDeFiltreDesActivites>
>
