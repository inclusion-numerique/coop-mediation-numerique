import { prismaClient } from '@app/web/prismaClient'

/**
 * Import unique des lieux d'activité à l'inscription, lu dans `main` au lieu de l'API Dataspace.
 *
 * L'ancien chemin recevait des lieux en clair (nom, adresse, contact), écartait ceux dont l'adresse
 * était incomplète, puis faisait un find-or-create dans `coop.lieu_inclusion` en espérant retomber
 * sur la bonne ligne. Rien de tout cela n'est nécessaire ici : `main.lieu_inclusion` porte
 * `structure_coop_id`, le lien direct vers la ligne coop. Vérifié sur la base : les 12 886
 * affectations lieu actives le portent toutes, et toutes désignent une ligne coop qui existe.
 *
 * Il ne reste donc qu'à créer le rattachement `coop.mediateurs_en_activite` — pas de reconstruction
 * d'adresse, pas de géocodage, pas d'appariement heuristique.
 *
 * `main.*` est qualifié explicitement : le `search_path` (`coop,public`) ne l'inclut pas.
 */

type LieuRow = { structure_id: string }

const lieuxDuDispositif = (userId: string): Promise<LieuRow[]> =>
  prismaClient.$queryRaw<LieuRow[]>`
    SELECT DISTINCT li.structure_coop_id AS structure_id
    FROM main.personne p
    JOIN main.personne_affectations_lieu al
      ON al.personne_id = p.id AND al.est_active
    JOIN main.lieu_inclusion li
      ON li.id = al.lieu_id AND li.deleted_at IS NULL
    WHERE p.coop_id = ${userId}::uuid
      AND li.structure_coop_id IS NOT NULL`

export const importerLieuxActiviteDepuisMain = async ({
  userId,
  mediateurId,
}: {
  userId: string
  mediateurId: string
}): Promise<{ structureIds: string[] }> => {
  const lieux = await lieuxDuDispositif(userId)
  const structureIds = lieux.map(({ structure_id }) => structure_id)

  if (structureIds.length === 0) return { structureIds: [] }

  const dejaRattaches = await prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateurId,
      structureId: { in: structureIds },
      suppression: null,
      fin: null,
    },
    select: { structureId: true },
  })

  const aRattacher = structureIds.filter(
    (structureId) =>
      !dejaRattaches.some((rattache) => rattache.structureId === structureId),
  )

  await prismaClient.mediateurEnActivite.createMany({
    // `debut` n'a pas de valeur par défaut : le rattachement commence à l'inscription, faute d'une
    // date d'entrée en poste fiable côté dispositif.
    data: aRattacher.map((structureId) => ({
      mediateurId,
      structureId,
      debut: new Date(),
    })),
  })

  return { structureIds }
}
