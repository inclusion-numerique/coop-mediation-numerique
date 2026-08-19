import { success } from '@app/web/libraries/result'
import type { CompteRdvLie } from '../../../domain/compte-rdv'
import { JetonAcces } from '../../../domain/jetons-oauth'
import { OrganisationId } from '../../../domain/organisation-id'
import { RdvAgentId } from '../../../domain/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import { synchroniserRdvs } from './synchroniser-rdvs'

/**
 * Portée du ramassage des motifs orphelins.
 *
 * Le port l'exigeait naguère facultative, et l'absence valait « pas de filtre » :
 * la passe d'un compte supprimait alors les motifs de tous les autres, se les
 * imputait au bilan, et pouvait effacer un motif qu'une passe concurrente venait
 * de créer sans avoir encore écrit le rendez-vous qui le porte — la clé étrangère
 * faisait échouer cette passe-là. Une passe complète l'est pour son compte, pas
 * pour la base.
 */

const compte: CompteRdvLie = {
  _tag: 'lie',
  agentId: RdvAgentId(9546),
  utilisateurId: UtilisateurCoopId('11111111-1111-4111-8111-111111111111'),
  organisationIds: [OrganisationId(3089), OrganisationId(3090)],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
  jetons: {
    acces: JetonAcces('acces'),
    rafraichissement: null,
    expiration: null,
    portee: null,
  },
}

const dependancesAvec = (supprimerMotifsOrphelins: jest.Mock) => ({
  listerRdvs: async () => success([]),
  rdvsDejaImportes: async () => [],
  etatConnuDuLot: async () => ({
    rdvs: new Map(),
    motifs: new Map(),
    lieux: new Map(),
    usagers: new Map(),
  }),
  appliquerPlan: async () => {
    // Rien à écrire : aucun rendez-vous reçu.
  },
  supprimerRdvs: async () => {
    // Rien à supprimer.
  },
  supprimerMotifsOrphelins,
  rapprocherBeneficiaires: async () => {
    // Hors sujet ici.
  },
})

describe('ramassage des motifs orphelins', () => {
  it('se borne aux organisations du compte quand la passe est complète', async () => {
    const supprimerMotifsOrphelins = jest.fn().mockResolvedValue(0)

    await synchroniserRdvs(dependancesAvec(supprimerMotifsOrphelins))({
      compte,
    })

    expect(supprimerMotifsOrphelins).toHaveBeenCalledWith(
      compte.organisationIds,
    )
  })

  it('se borne à la portée demandée quand la passe est restreinte', async () => {
    const supprimerMotifsOrphelins = jest.fn().mockResolvedValue(0)
    const organisationIds = [OrganisationId(3090)]

    await synchroniserRdvs(dependancesAvec(supprimerMotifsOrphelins))({
      compte,
      organisationIds,
    })

    expect(supprimerMotifsOrphelins).toHaveBeenCalledWith(organisationIds)
  })
})
