import { success } from '@app/web/libraries/result'
import {
  bilanSynchronisationVide,
  bilanVide,
  deriveTotale,
} from '../../../domain/bilan-synchronisation'
import {
  type CloturerJournal,
  type EchouerJournal,
  type OuvrirJournal,
  type PorteeDemandee,
  passePour,
  type ReconcilierOrganisations,
  type ReconcilierRdvs,
  type ReconcilierWebhooks,
  type ResultatSynchronisation,
  type SynchroniserCompteRdv,
} from '../domain/synchroniser-compte-rdv'

export type DependancesSynchroniserCompteRdv = {
  readonly reconcilierOrganisations: ReconcilierOrganisations
  readonly reconcilierRdvs: ReconcilierRdvs
  readonly reconcilierWebhooks: ReconcilierWebhooks
  readonly ouvrirJournal: OuvrirJournal
  readonly cloturerJournal: CloturerJournal
  readonly echouerJournal: EchouerJournal
  readonly journaliser?: (message: string) => void
}

const sansObjet: ResultatSynchronisation = {
  bilan: bilanSynchronisationVide,
  derive: 0,
  organisationIdsSansWebhook: undefined,
}

/**
 * Réconcilie un compte avec RDV Service Public.
 *
 * L'ordre n'est pas indifférent : les organisations d'abord, dont les rendez-vous
 * dépendent ; les rendez-vous ensuite, qui amènent motifs, lieux et usagers ; les
 * webhooks en dernier, pour que les notifications reprennent sur un état à jour.
 *
 * Un échec est consigné puis propagé. La trace vaut mieux que le silence : c'est
 * elle que l'administration lit quand un compte cesse de se synchroniser.
 */
export const synchroniserCompteRdv =
  ({
    reconcilierOrganisations,
    reconcilierRdvs,
    reconcilierWebhooks,
    ouvrirJournal,
    cloturerJournal,
    echouerJournal,
    journaliser = () => {
      // Journal facultatif.
    },
  }: DependancesSynchroniserCompteRdv): SynchroniserCompteRdv =>
  async (portee: PorteeDemandee) => {
    const passe = passePour(portee)

    if (passe._tag === 'sansObjet') {
      journaliser('aucune organisation à synchroniser')
      return success(sansObjet)
    }

    const { compte } = portee
    const { journalId } = await ouvrirJournal({
      compte,
      organisationIds: passe.organisationIds,
    })
    const lignes: string[] = []
    const tracer = (message: string) => {
      lignes.push(message)
      journaliser(message)
    }

    try {
      // Chaque étape s'annonce avant d'agir, et rend compte après. Ne tracer
      // qu'au succès laissait un journal vide quand la première étape tombait —
      // exactement le cas où on a besoin de savoir où on en était.
      tracer(
        passe.toutesOrganisations
          ? 'réconciliation des organisations'
          : 'organisations non réconciliées (passe restreinte)',
      )

      const organisations = passe.toutesOrganisations
        ? await reconcilierOrganisations(compte)
        : success(bilanVide)

      if (!organisations.success) {
        await echouerJournal({
          journalId,
          message: organisations.error._tag,
          journal: lignes.join('\n'),
        })
        return organisations
      }

      tracer('organisations réconciliées')
      tracer('réconciliation des rendez-vous')

      const rdvs = await reconcilierRdvs({
        compte,
        organisationIds: passe.organisationIds,
      })

      if (!rdvs.success) {
        await echouerJournal({
          journalId,
          message: rdvs.error._tag,
          journal: lignes.join('\n'),
        })
        return rdvs
      }

      tracer('rendez-vous réconciliés')
      tracer('installation des webhooks')

      const webhooks = await reconcilierWebhooks({
        compte,
        organisationIds: passe.organisationIds,
      })

      tracer('webhooks installés')

      const bilan = {
        organisations: organisations.data,
        rdvs: rdvs.data.rdvs,
        users: rdvs.data.usagers,
        motifs: rdvs.data.motifs,
        lieux: rdvs.data.lieux,
        webhooks: webhooks.bilan,
      }

      const resultat: ResultatSynchronisation = {
        bilan,
        derive: deriveTotale(bilan),
        organisationIdsSansWebhook: webhooks.organisationIdsSansWebhook,
      }

      await cloturerJournal({
        journalId,
        resultat,
        journal: lignes.join('\n'),
      })

      return success(resultat)
    } catch (erreur) {
      await echouerJournal({
        journalId,
        message: erreur instanceof Error ? erreur.message : String(erreur),
        journal: lignes.join('\n'),
      })
      throw erreur
    }
  }
