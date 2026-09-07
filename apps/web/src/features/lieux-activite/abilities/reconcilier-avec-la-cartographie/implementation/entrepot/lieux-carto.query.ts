import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'
import { IdsCartographieNationale } from '@app/web/features/lieux-activite/domain/ids-cartographie-nationale'
import { SourceCartographie } from '@app/web/features/lieux-activite/domain/tracabilite'
import { type LieuCarto, PREFIXE_COOP } from '../../domain'

/**
 * Les lieux de `main.lieu_inclusion` dont l'identifiant composite cite la coop.
 *
 * La donnée vit dans l'Entrepôt depuis la bascule ADR-002 ; la coop n'en garde
 * que le lien. Le filtre `contains` écarte en base l'immense majorité des lieux
 * qui ne nous concernent pas — l'extraction fine des identifiants se fait
 * ensuite, en mémoire.
 */
export const lireLesLieuxCarto = async (): Promise<readonly LieuCarto[]> => {
  const lieux = await entrepotPrismaClient.lieuInclusion.findMany({
    where: { structureCartographieNationaleId: { contains: PREFIXE_COOP } },
    select: {
      structureCartographieNationaleId: true,
      source: true,
      updatedAt: true,
    },
  })

  return lieux.flatMap(
    ({ structureCartographieNationaleId, source, updatedAt }) => {
      const identifiantCartographie =
        structureCartographieNationaleId == null
          ? null
          : IdsCartographieNationale.safe(structureCartographieNationaleId)

      return identifiantCartographie == null
        ? []
        : [
            {
              identifiantCartographie,
              source: source == null ? null : SourceCartographie.safe(source),
              dateMaj: updatedAt,
            },
          ]
    },
  )
}
