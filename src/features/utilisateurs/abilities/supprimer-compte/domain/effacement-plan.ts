import {
  type CompteASupprimer,
  coordinateurDe,
  identifiantsDe,
  type MediateurId,
  mediateurDe,
} from '@/features/utilisateurs/domain'
import { type EchecTechnique, type Result, success } from '@/libraries/result'
import { EffacementStep, type NomEffacementStep } from './effacement-report'
import type { EffacementsDuCompte } from './ports'

type Runner = () => Promise<Result<number, EchecTechnique>>

export type EtapePlanifiee = {
  readonly step: EffacementStep
  readonly runner: Runner
}

type Planification = (
  compte: CompteASupprimer,
  ports: EffacementsDuCompte,
) => Runner | null

const pourLeMediateur =
  (
    runner: (mediateurId: MediateurId, ports: EffacementsDuCompte) => Runner,
  ): Planification =>
  (compte, ports) => {
    const mediateurId = mediateurDe(compte.rattachements)
    return mediateurId === null ? null : runner(mediateurId, ports)
  }

const pourLEquipe =
  (
    runner: (compte: CompteASupprimer, ports: EffacementsDuCompte) => Runner,
  ): Planification =>
  (compte, ports) =>
    mediateurDe(compte.rattachements) === null &&
    coordinateurDe(compte.rattachements) === null
      ? null
      : runner(compte, ports)

const compter = <T>(
  resultat: Result<T, EchecTechnique>,
  nombre: (effaces: T) => number,
): Result<number, EchecTechnique> =>
  resultat.success ? success(nombre(resultat.data)) : resultat

const anonymiserLePortefeuille = pourLeMediateur(
  (mediateurId, ports) => async () =>
    compter(
      await ports.anonymiserPortefeuille({ mediateurId }),
      ({ anonymises }) => anonymises,
    ),
)

const effacerLEmpreinteRdv: Planification = (compte, ports) => async () =>
  compter(
    await ports.effacerEmpreinteRdv({ utilisateurId: compte.id }),
    ({ rdvsExpurges, usagersSupprimes }) => rdvsExpurges + usagersSupprimes,
  )

const effacerLesNotes = pourLEquipe(
  (compte, ports) => async () =>
    compter(
      await ports.effacerNotes(identifiantsDe(compte.rattachements)),
      ({ effacees }) => effacees,
    ),
)

const detacherDesEquipes = pourLEquipe((compte, ports) => async () => {
  const identifiants = identifiantsDe(compte.rattachements)
  const tags = await ports.retirerLesTagsDUnCompte(identifiants)
  if (!tags.success) return tags
  const { transferes, supprimes } = tags.data

  return compter(
    await ports.detacherDesEquipes(identifiants),
    ({ invitationsSupprimees, appartenancesRetirees }) =>
      invitationsSupprimees + appartenancesRetirees + transferes + supprimes,
  )
})

const retirerDesLieux = pourLeMediateur(
  (mediateurId, ports) => async () =>
    compter(
      await ports.retirerDesLieux({ mediateurId }),
      ({ rattachementsSupprimes }) => rattachementsSupprimes,
    ),
)

const revoquerLePartage = pourLEquipe(
  (compte, ports) => async () =>
    compter(
      await ports.revoquerPartageStatistiques(
        identifiantsDe(compte.rattachements),
      ),
      ({ partagesRevoques }) => partagesRevoques,
    ),
)

const retirerDesListes: Planification = (compte, ports) => async () =>
  compter(await ports.retirerDesListesDeDiffusion(compte.courriel), (retire) =>
    retire ? 1 : 0,
  )

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
  ports: EffacementsDuCompte,
): readonly EtapePlanifiee[] =>
  PLAN_ORDONNE.flatMap(([nom, planifier]) => {
    const runner = planifier(compte, ports)
    return runner === null ? [] : [{ step: EffacementStep(nom), runner }]
  })
