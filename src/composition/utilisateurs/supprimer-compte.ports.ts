import { effacerNotes } from '@/features/activites/abilities/effacer-notes'
import { CoordinateurId, MediateurId } from '@/features/activites/domain'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille'
import { detacherDesEquipes } from '@/features/equipe'
import { retirerDesLieux } from '@/features/lieux-activite/abilities/retirer-des-lieux'
import { revoquerPartageStatistiques } from '@/features/mediateurs/abilities/revoquer-partage-statistiques'
import { effacerEmpreinteRdv } from '@/features/rdvsp/abilities/effacer-empreinte-rdv'
import { retirerLesTagsDUnCompte } from '@/features/tags/abilities/retirer-les-tags-d-un-compte'
import {
  hash,
  retirerDesListesDeDiffusion,
  type SupprimerComptePorts,
} from '@/features/utilisateurs/abilities/supprimer-compte'
import { identifiantsDe } from '@/features/utilisateurs/domain'

export const supprimerComptePorts: SupprimerComptePorts = {
  anonymiserPortefeuille,
  effacerEmpreinteRdv,
  retirerDesLieux,
  effacerNotes: ({ rattachements }) => {
    const { mediateurId, coordinateurId } = identifiantsDe(rattachements)
    return effacerNotes({
      mediateurId: mediateurId === null ? null : MediateurId(mediateurId),
      coordinateurId:
        coordinateurId === null ? null : CoordinateurId(coordinateurId),
    })
  },
  detacherDesEquipes: async ({ rattachements }) => {
    const identifiants = identifiantsDe(rattachements)
    const tags = await retirerLesTagsDUnCompte(identifiants)
    const equipes = await detacherDesEquipes(identifiants)

    return {
      ...equipes,
      tagsTransferes: tags.transferes,
      tagsSupprimes: tags.supprimes,
    }
  },
  revoquerPartageStatistiques: ({ rattachements }) =>
    revoquerPartageStatistiques(identifiantsDe(rattachements)),
  retirerDesListesDeDiffusion,
  hash,
}
