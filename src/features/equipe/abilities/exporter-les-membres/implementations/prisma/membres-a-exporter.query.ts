import { prismaClient } from '@/configuration/prisma'
import { profilDe } from '../../../../domain'
import {
  filtresEquipe,
  type LigneEquipeRow,
  lignesEquipeCte,
  triEquipe,
} from '../../../../implementations/prisma/ligne-equipe.sql'
import { toLignesEquipe } from '../../../../implementations/prisma/ligne-equipe.transfer'
import type { LireLesMembresAExporter } from '../../domain/exporter-les-membres'
import { contratsDesMembres } from './contrats-des-membres.query'

export const lireLesMembresAExporter: LireLesMembresAExporter = async ({
  coordinateurId,
  criteres,
  maintenant,
}) => {
  const lignes = toLignesEquipe(
    await prismaClient.$queryRaw<LigneEquipeRow[]>`
      ${lignesEquipeCte({ coordinateurId, maintenant })}
      SELECT * FROM lignes
      ${filtresEquipe(criteres)}
      ${triEquipe(criteres)}`,
  )

  const contrats = await contratsDesMembres(
    lignes.flatMap((ligne) => {
      const profil = profilDe(ligne)
      return profil === null ? [] : [profil.utilisateurId]
    }),
    maintenant,
  )

  return lignes.map((ligne) => {
    const profil = profilDe(ligne)
    return {
      ligne,
      contrat:
        profil === null ? null : (contrats.get(profil.utilisateurId) ?? null),
    }
  })
}
