import { prismaClient } from '@app/web/prismaClient'
import { porteeDe } from '../../../../db/portee-de-tag'
import { type MediateurId, NomDeTag, TagId } from '../../../../domain'

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
        where: { mediateurId },
      }),
      employeusesDesActivites(mediateurId),
      prismaClient.tag.findMany({
        where: { activites: { some: { activite: { mediateurId } } } },
        select: {
          id: true,
          nom: true,
          mediateurId: true,
          coordinateurId: true,
          departement: true,
          equipe: true,
        },
        orderBy: { nom: 'asc' },
      }),
      prismaClient.activite.findFirst({
        where: { mediateurId, v1CraId: { not: null } },
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
      first: bornes._min.date ?? undefined,
      last: bornes._max.date ?? undefined,
    },
    employeuses: employeuses.map((structure) => ({
      id: String(structure.id),
      nom: structure.denominationAntenne ?? structure.denominationSirene ?? '',
      commune: structure.adresse?.nomCommune ?? null,
    })),
    tags: tags.flatMap((tag) => {
      const nom = NomDeTag.safe(tag.nom)
      return nom === null
        ? []
        : [{ id: TagId(tag.id), nom, portee: porteeDe(tag) }]
    }),
    importsV1: importV1 !== null,
    aDesActivites: uneActivite !== null,
  }
}

export type OptionsDeFiltreDesActivites = Awaited<
  ReturnType<typeof optionsDeFiltreDesActivites>
>
