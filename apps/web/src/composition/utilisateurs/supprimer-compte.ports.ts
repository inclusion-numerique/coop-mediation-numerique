import { effacerNotes } from '@app/web/features/activites/abilities/effacer-notes'
import { anonymiserPortefeuille } from '@app/web/features/beneficiaire/abilities/anonymiser-portefeuille'
import { detacherDesEquipes } from '@app/web/features/equipe'
import { retirerDesLieux } from '@app/web/features/lieux-activite/abilities/retirer-des-lieux'
import { revoquerPartageStatistiques } from '@app/web/features/mediateurs/abilities/revoquer-partage-statistiques'
import { effacerEmpreinteRdv } from '@app/web/features/rdvsp/abilities/effacer-empreinte-rdv'
import {
  hash,
  retirerDesListesDeDiffusion,
  type SupprimerComptePorts,
} from '@app/web/features/utilisateurs/abilities/supprimer-compte'
import { identifiantsDe } from '@app/web/features/utilisateurs/domain'

export const supprimerComptePorts: SupprimerComptePorts = {
  anonymiserPortefeuille,
  effacerEmpreinteRdv,
  retirerDesLieux,
  effacerNotes: ({ rattachements }) =>
    effacerNotes(identifiantsDe(rattachements)),
  detacherDesEquipes: ({ rattachements }) =>
    detacherDesEquipes(identifiantsDe(rattachements)),
  revoquerPartageStatistiques: ({ rattachements }) =>
    revoquerPartageStatistiques(identifiantsDe(rattachements)),
  retirerDesListesDeDiffusion,
  hash,
}
