import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import {
  filtresEquipe,
  type LigneEquipeRow,
  lignesEquipeCte,
  triEquipe,
} from '../../../../db/ligne-equipe.sql'
import { toLignesEquipe } from '../../../../db/ligne-equipe.transfer'
import {
  ConsultationNonAutorisee,
  type CoordinateurId,
  type CriteresEquipe,
  type Lecteur,
  type LigneEquipe,
  peutConsulterLEquipe,
  profilDe,
} from '../../../../domain'
import type { MembreAExporter } from '../../domain'
import { contratsDesMembres } from './contrats-des-membres.query'

export const exporterLesMembres = async ({
  coordinateurId,
  lecteur,
  criteres,
  maintenant = new Date(),
}: {
  coordinateurId: CoordinateurId
  lecteur: Lecteur
  criteres: CriteresEquipe
  maintenant?: Date
}): Promise<
  Result<readonly MembreAExporter<LigneEquipe>[], ConsultationNonAutorisee>
> => {
  if (!peutConsulterLEquipe(lecteur)(coordinateurId))
    return failure(ConsultationNonAutorisee())

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

  return success(
    lignes.map((ligne) => {
      const profil = profilDe(ligne)
      return {
        ligne,
        contrat:
          profil === null ? null : (contrats.get(profil.utilisateurId) ?? null),
      }
    }),
  )
}
