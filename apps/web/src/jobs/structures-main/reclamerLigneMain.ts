import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { mergeStructureAdministrative } from '@app/web/features/structures/use-cases/merge/mutations/mergeStructureAdministrative'
import { prismaClient } from '@app/web/prismaClient'

// RÉCLAMATION d'une ligne `main` occupée à tort — à tenter AVANT toute création.
//
// Le cas : une ligne `main.structure_administrative` porte le SIRET d'une employeuse coop
// et l'antenne nulle (donc l'identité légale de ce SIRET), mais son `structure_coop_id`
// pointe vers une AUTRE ligne coop qui ne porte pas ce SIRET. L'occupante revendique une
// identité qui n'est pas la sienne ; la ligne revient à l'orpheline, qui absorbe l'occupante.
//
// Deux occurrences réelles, de natures différentes :
//   • POSSE 33 (Chambéry) — la même structure saisie deux fois, une avec SIRET et une sans.
//     La version sans SIRET avait capté le lien et tout l'historique.
//   • Forum du Pays Provinois — transfert de siège : l'occupante porte l'établissement
//     ...00014 fermé le 11/10/2024, la ligne `main` porte le ...00022 actif créé le même jour.
//
// GARDE-FOU — on ne réclame QUE si l'occupante n'a pas de SIRET, ou en a un du MÊME SIREN.
// Sans cette borne on absorberait des structures sans rapport. Mesuré sur la prod : 25 452
// paires coop de même SIREN sont dans des communes différentes contre 224 dans la même, donc
// un rapprochement au SIREN seul serait massivement abusif — ici c'est la ligne `main` elle
// même, avec son SIRET exact et son antenne nulle, qui désigne la bonne orpheline.
//
// SENS DE LA FUSION — l'ORPHELINE survit, même quand elle est la plus pauvre en activités :
// `completeTargetIdentity` fait `siret: target.siret ?? source.siret` et ne remplace jamais
// une valeur existante. Fusionner dans l'autre sens laisserait la survivante sans SIRET
// (POSSE 33) ou avec un SIRET fermé (Forum du Pays Provinois).

export type Reclamation = {
  mainId: number
  occupanteId: string
  occupanteNom: string
  occupanteSiret: string | null
}

export const trouverLigneAReclamer = async (employeuse: {
  id: string
  siret: string | null
}): Promise<Reclamation | null> => {
  if (employeuse.siret === null) {
    return null
  }

  const lignes = await entrepotPrismaClient.$queryRaw<
    { id: number; structure_coop_id: string }[]
  >`
    SELECT id, structure_coop_id
    FROM main.structure_administrative
    WHERE siret = ${employeuse.siret}
      AND denomination_antenne IS NULL
      AND structure_coop_id IS NOT NULL
  `

  const ligne = lignes.at(0)

  if (ligne === undefined) {
    return null
  }

  const occupante = await prismaClient.structureAdministrative.findUnique({
    where: { id: ligne.structure_coop_id },
    select: { id: true, nom: true, siret: true },
  })

  if (occupante === null || occupante.id === employeuse.id) {
    return null
  }

  // L'occupante légitime porte le même SIRET : on ne lui prend rien.
  if (occupante.siret === employeuse.siret) {
    return null
  }

  const memeEntite =
    occupante.siret === null ||
    occupante.siret.slice(0, 9) === employeuse.siret.slice(0, 9)

  if (!memeEntite) {
    return null
  }

  return {
    mainId: ligne.id,
    occupanteId: occupante.id,
    occupanteNom: occupante.nom,
    occupanteSiret: occupante.siret,
  }
}

// Repointer AVANT d'absorber : dans l'ordre inverse, la suppression de l'occupante
// laisserait `main` pointer vers une ligne coop disparue.
export const reclamerLigneMain = async (
  employeuseId: string,
  reclamation: Reclamation,
): Promise<{ statut: 'reclamee' | 'echec'; detail: string }> => {
  const misesAJour = await entrepotPrismaClient.$executeRaw`
    UPDATE main.structure_administrative
    SET structure_coop_id = ${employeuseId}::uuid,
        updated_at = now(), updated_at_coop = now()
    WHERE id = ${reclamation.mainId}
      AND structure_coop_id = ${reclamation.occupanteId}::uuid
  `

  if (misesAJour !== 1) {
    return {
      statut: 'echec',
      detail: `main ${reclamation.mainId} ne pointe plus vers l'occupante attendue`,
    }
  }

  return mergeStructureAdministrative(reclamation.occupanteId, employeuseId)
    .then(() => ({
      statut: 'reclamee' as const,
      detail:
        `main ${reclamation.mainId} reprise sur « ${reclamation.occupanteNom} » ` +
        `(siret ${reclamation.occupanteSiret ?? 'absent'}), occupante absorbée`,
    }))
    .catch((error: unknown) => ({
      statut: 'echec' as const,
      detail: `lien repointé mais fusion échouée : ${String(error).slice(0, 90)}`,
    }))
}
