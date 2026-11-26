import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import { afficherRdvsDansActivites } from './afficher-rdvs-dans-activites'

const utilisateurId = UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c')

describe('afficher les rendez-vous dans les activités', () => {
  it('règle l’affichage des rendez-vous du compte de l’utilisateur', async () => {
    const afficher = afficherRdvsDansActivites({
      compteRdvExiste: async () => true,
      enregistrerLAffichage: async () => undefined,
    })

    expect(await afficher({ utilisateurId, afficher: true })).toEqual(
      success({ utilisateurId, afficher: true }),
    )
  })

  it('refuse le réglage tant qu’aucun compte RDV n’est connecté', async () => {
    const afficher = afficherRdvsDansActivites({
      compteRdvExiste: async () => false,
      enregistrerLAffichage: async () => undefined,
    })

    expect(await afficher({ utilisateurId, afficher: true })).toEqual(
      failure({ _tag: 'CompteRdvIntrouvable', utilisateurId }),
    )
  })
})
