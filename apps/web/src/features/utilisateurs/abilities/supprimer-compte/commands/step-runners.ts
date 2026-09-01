import {
  type CompteASupprimer,
  mediateurDe,
} from '@app/web/features/utilisateurs/domain'
import type { NomEffacementStep, SupprimerComptePorts } from '../domain'

type Runner = () => Promise<number>

type FabriqueRunner = (
  compte: CompteASupprimer,
  ports: SupprimerComptePorts,
) => Runner

const anonymiserLePortefeuille: FabriqueRunner =
  (compte, ports) => async () => {
    const mediateurId = mediateurDe(compte.rattachements)

    return mediateurId === null
      ? 0
      : (await ports.anonymiserPortefeuille({ mediateurId })).anonymises
  }

const effacerLEmpreinteRdv: FabriqueRunner = (compte, ports) => async () => {
  const { rdvsExpurges, usagersSupprimes } = await ports.effacerEmpreinteRdv({
    utilisateurId: compte.id,
  })

  return rdvsExpurges + usagersSupprimes
}

const effacerLesNotes: FabriqueRunner = (compte, ports) => async () => {
  const { effacees } = await ports.effacerNotes({
    rattachements: compte.rattachements,
  })

  return effacees
}

const detacherDesEquipes: FabriqueRunner = (compte, ports) => async () => {
  const {
    invitationsSupprimees,
    appartenancesSupprimees,
    tagsTransferes,
    tagsSupprimes,
  } = await ports.detacherDesEquipes({ rattachements: compte.rattachements })

  return (
    invitationsSupprimees +
    appartenancesSupprimees +
    tagsTransferes +
    tagsSupprimes
  )
}

const retirerDesLieux: FabriqueRunner = (compte, ports) => async () => {
  const mediateurId = mediateurDe(compte.rattachements)

  return mediateurId === null
    ? 0
    : (await ports.retirerDesLieux({ mediateurId })).rattachementsSupprimes
}

const revoquerLePartage: FabriqueRunner = (compte, ports) => async () => {
  const { partagesRevoques } = await ports.revoquerPartageStatistiques({
    rattachements: compte.rattachements,
  })

  return partagesRevoques
}

const retirerDesListes: FabriqueRunner = (compte, ports) => async () =>
  (await ports.retirerDesListesDeDiffusion(compte.courriel)) ? 1 : 0

const RUNNER_PAR_STEP: Record<NomEffacementStep, FabriqueRunner> = {
  PortefeuilleBeneficiaires: anonymiserLePortefeuille,
  EmpreinteRdv: effacerLEmpreinteRdv,
  NotesAccompagnements: effacerLesNotes,
  AppartenancesEquipe: detacherDesEquipes,
  LieuxActivite: retirerDesLieux,
  PartageStatistiques: revoquerLePartage,
  ListesDeDiffusion: retirerDesListes,
}

export const runnerDe = (
  step: NomEffacementStep,
  compte: CompteASupprimer,
  ports: SupprimerComptePorts,
): Runner => RUNNER_PAR_STEP[step](compte, ports)
