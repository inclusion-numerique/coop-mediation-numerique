import type { ProjeterEtapeFranchie } from '@app/web/features/inscription/abilities/renseigner-structure-employeuse/domain'
import { inscriptionEtatFromDomain } from '@app/web/features/inscription/db'
import { prismaClient } from '@app/web/prismaClient'

/**
 * Projette l'état d'inscription — qui porte déjà l'étape franchie — scopé sur
 * l'utilisateur courant. Les colonnes d'inscription viennent du transfer,
 * jamais composées à la main ici.
 *
 * Plus de transaction : l'emploi ne s'écrit plus avec l'état depuis que le
 * rattachement appartient à la feature employeuse, qui porte sa propre
 * atomicité. Il ne reste qu'une seule écriture à faire.
 */
export const projeterEtapeFranchie: ProjeterEtapeFranchie = async (etat) => {
  await prismaClient.user.update({
    where: { id: etat.userId },
    data: inscriptionEtatFromDomain(etat),
    select: { id: true },
  })
}
