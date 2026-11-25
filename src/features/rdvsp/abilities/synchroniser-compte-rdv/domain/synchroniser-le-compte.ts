import { bilanVide } from '@/features/rdvsp/domain/compte/bilan-synchronisation'
import {
  type CompteRdv,
  estUtilisable,
} from '@/features/rdvsp/domain/compte/compte-rdv'
import { EchecDeSynchronisation } from '@/features/rdvsp/domain/compte/echec-de-synchronisation'
import { diagnosticErreur } from '@/features/rdvsp/domain/errors'
import { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import type { RdvAgentId } from '@/features/rdvsp/domain/identifiants/rdv-agent-id'
import { success } from '@/libraries/result'
import {
  type CloturerJournal,
  type DetacherOrganisations,
  type EchouerJournal,
  type OuvrirJournal,
  type ReconcilierLesRdvsDuMediateur,
  type ReconcilierOrganisations,
  type ReconcilierRdvs,
  type ReconcilierWebhooks,
  synchroniserCompteRdv,
} from './synchroniser-compte-rdv'

const bilanRdvsVide = {
  rdvs: bilanVide,
  usagers: bilanVide,
  motifs: bilanVide,
  lieux: bilanVide,
  organisationIdsInaccessibles: [],
}

const silencieux = () => undefined

const rdvsDuMediateur =
  (
    reconcilierLesRdvsDuMediateur: ReconcilierLesRdvsDuMediateur,
    mediateurId: string | undefined,
  ): ReconcilierRdvs =>
  async (portee) =>
    mediateurId === undefined
      ? success(bilanRdvsVide)
      : reconcilierLesRdvsDuMediateur({
          mediateurId,
          journaliser: silencieux,
        })(portee)

export const synchroniserLeCompte =
  ({
    lireLeCompte,
    reconcilierLesRdvsDuMediateur,
    noterLaSynchronisationReussie,
    ...dependances
  }: {
    readonly lireLeCompte: (compteId: number) => Promise<CompteRdv>
    readonly reconcilierOrganisations: ReconcilierOrganisations
    readonly reconcilierLesRdvsDuMediateur: ReconcilierLesRdvsDuMediateur
    readonly reconcilierWebhooks: ReconcilierWebhooks
    readonly detacherOrganisations: DetacherOrganisations
    readonly ouvrirJournal: OuvrirJournal
    readonly cloturerJournal: CloturerJournal
    readonly echouerJournal: EchouerJournal
    readonly noterLaSynchronisationReussie: (input: {
      readonly agentId: RdvAgentId
      readonly organisationIdsSansWebhook: readonly OrganisationId[] | undefined
    }) => Promise<void>
  }) =>
  async ({
    compteId,
    mediateurId,
    organisationIds,
  }: {
    readonly compteId: number
    readonly mediateurId?: string
    readonly organisationIds?: readonly number[]
  }): Promise<{ readonly drift: number }> => {
    const compte = await lireLeCompte(compteId)

    if (!estUtilisable(compte)) return { drift: 0 }

    const resultat = await synchroniserCompteRdv({
      ...dependances,
      reconcilierRdvs: rdvsDuMediateur(
        reconcilierLesRdvsDuMediateur,
        mediateurId,
      ),
    })({
      compte,
      ...(organisationIds === undefined
        ? {}
        : { organisationIds: organisationIds.map((id) => OrganisationId(id)) }),
    })

    if (!resultat.success)
      throw new EchecDeSynchronisation(
        resultat.error._tag,
        diagnosticErreur(resultat.error),
      )

    await noterLaSynchronisationReussie({
      agentId: compte.agentId,
      organisationIdsSansWebhook: resultat.data.organisationIdsSansWebhook,
    })

    return { drift: resultat.data.derive }
  }
