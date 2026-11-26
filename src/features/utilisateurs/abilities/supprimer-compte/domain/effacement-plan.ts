import {
  type CompteASupprimer,
  coordinateurDe,
  identifiantsDe,
  type MediateurId,
  mediateurDe,
} from '@/features/utilisateurs/domain'
import { EffacementStep, type NomEffacementStep } from './effacement-report'
import type { SupprimerComptePorts } from './ports'

type Runner = () => Promise<number>

export type EtapePlanifiee = {
  readonly step: EffacementStep
  readonly runner: Runner
}

type Planification = (
  compte: CompteASupprimer,
  ports: SupprimerComptePorts,
) => Runner | null

const pourLeMediateur =
  (
    runner: (mediateurId: MediateurId, ports: SupprimerComptePorts) => Runner,
  ): Planification =>
  (compte, ports) => {
    const mediateurId = mediateurDe(compte.rattachements)
    return mediateurId === null ? null : runner(mediateurId, ports)
  }

const pourLEquipe =
  (
    runner: (compte: CompteASupprimer, ports: SupprimerComptePorts) => Runner,
  ): Planification =>
  (compte, ports) =>
    mediateurDe(compte.rattachements) === null &&
    coordinateurDe(compte.rattachements) === null
      ? null
      : runner(compte, ports)

const anonymiserLePortefeuille = pourLeMediateur(
  (mediateurId, ports) => async () =>
    (await ports.anonymiserPortefeuille({ mediateurId })).anonymises,
)

const effacerLEmpreinteRdv: Planification = (compte, ports) => async () => {
  const { rdvsExpurges, usagersSupprimes } = await ports.effacerEmpreinteRdv({
    utilisateurId: compte.id,
  })

  return rdvsExpurges + usagersSupprimes
}

const effacerLesNotes = pourLEquipe(
  (compte, ports) => async () =>
    (await ports.effacerNotes(identifiantsDe(compte.rattachements))).effacees,
)

const detacherDesEquipes = pourLEquipe((compte, ports) => async () => {
  const identifiants = identifiantsDe(compte.rattachements)
  const { transferes, supprimes } =
    await ports.retirerLesTagsDUnCompte(identifiants)
  const { invitationsSupprimees, appartenancesRetirees } =
    await ports.detacherDesEquipes(identifiants)

  return invitationsSupprimees + appartenancesRetirees + transferes + supprimes
})

const retirerDesLieux = pourLeMediateur(
  (mediateurId, ports) => async () =>
    (await ports.retirerDesLieux({ mediateurId })).rattachementsSupprimes,
)

const revoquerLePartage = pourLEquipe(
  (compte, ports) => async () =>
    (
      await ports.revoquerPartageStatistiques(
        identifiantsDe(compte.rattachements),
      )
    ).partagesRevoques,
)

const retirerDesListes: Planification = (compte, ports) => async () =>
  (await ports.retirerDesListesDeDiffusion(compte.courriel)) ? 1 : 0

const PLAN_ORDONNE: readonly (readonly [NomEffacementStep, Planification])[] = [
  ['PortefeuilleBeneficiaires', anonymiserLePortefeuille],
  ['EmpreinteRdv', effacerLEmpreinteRdv],
  ['NotesAccompagnements', effacerLesNotes],
  ['AppartenancesEquipe', detacherDesEquipes],
  ['LieuxActivite', retirerDesLieux],
  ['PartageStatistiques', revoquerLePartage],
  ['ListesDeDiffusion', retirerDesListes],
]

export const effacementPlan = (
  compte: CompteASupprimer,
  ports: SupprimerComptePorts,
): readonly EtapePlanifiee[] =>
  PLAN_ORDONNE.flatMap(([nom, planifier]) => {
    const runner = planifier(compte, ports)
    return runner === null ? [] : [{ step: EffacementStep(nom), runner }]
  })
