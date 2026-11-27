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

export type Suppression = {
  readonly compte: CompteASupprimer
  readonly maintenant: Date
}

type Planification = (
  suppression: Suppression,
  ports: EffacementsDuCompte,
) => Runner | null

const pourLeMediateur =
  (
    runner: (mediateurId: MediateurId, ports: EffacementsDuCompte) => Runner,
  ): Planification =>
  ({ compte }, ports) => {
    const mediateurId = mediateurDe(compte.rattachements)
    return mediateurId === null ? null : runner(mediateurId, ports)
  }

const pourLEquipe =
  (
    runner: (suppression: Suppression, ports: EffacementsDuCompte) => Runner,
  ): Planification =>
  (suppression, ports) =>
    mediateurDe(suppression.compte.rattachements) === null &&
    coordinateurDe(suppression.compte.rattachements) === null
      ? null
      : runner(suppression, ports)

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

const effacerLEmpreinteRdv: Planification =
  ({ compte }, ports) =>
  async () =>
    compter(
      await ports.effacerEmpreinteRdv({ utilisateurId: compte.id }),
      ({ rdvsExpurges, usagersSupprimes }) => rdvsExpurges + usagersSupprimes,
    )

const effacerLesNotes = pourLEquipe(
  ({ compte }, ports) =>
    async () =>
      compter(
        await ports.effacerNotes(identifiantsDe(compte.rattachements)),
        ({ effacees }) => effacees,
      ),
)

const detacherDesEquipes = pourLEquipe(
  ({ compte, maintenant }, ports) =>
    async () => {
      const effacement = {
        ...identifiantsDe(compte.rattachements),
        maintenant,
      }
      const tags = await ports.retirerLesTagsDUnCompte(effacement)
      if (!tags.success) return tags
      const { transferes, supprimes } = tags.data

      return compter(
        await ports.detacherDesEquipes(effacement),
        ({ invitationsSupprimees, appartenancesRetirees }) =>
          invitationsSupprimees +
          appartenancesRetirees +
          transferes +
          supprimes,
      )
    },
)

const retirerDesLieux = pourLeMediateur(
  (mediateurId, ports) => async () =>
    compter(
      await ports.retirerDesLieux({ mediateurId }),
      ({ rattachementsSupprimes }) => rattachementsSupprimes,
    ),
)

const revoquerLePartage = pourLEquipe(
  ({ compte, maintenant }, ports) =>
    async () =>
      compter(
        await ports.revoquerPartageStatistiques({
          ...identifiantsDe(compte.rattachements),
          maintenant,
        }),
        ({ partagesRevoques }) => partagesRevoques,
      ),
)

const retirerDesListes: Planification =
  ({ compte }, ports) =>
  async () =>
    compter(
      await ports.retirerDesListesDeDiffusion(compte.courriel),
      (retire) => (retire ? 1 : 0),
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
  suppression: Suppression,
  ports: EffacementsDuCompte,
): readonly EtapePlanifiee[] =>
  PLAN_ORDONNE.flatMap(([nom, planifier]) => {
    const runner = planifier(suppression, ports)
    return runner === null ? [] : [{ step: EffacementStep(nom), runner }]
  })
