import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import { afficherRdvsDansActivites } from './afficher-rdvs-dans-activites'

const utilisateurId = UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c')

const regler = (compteExiste: boolean) =>
  afficherRdvsDansActivites({
    compteRdvExiste: async () => compteExiste,
    enregistrerLAffichage: async () => undefined,
  })({ utilisateurId, afficher: true })

describe('afficherRdvsDansActivites', () => {
  it('règle l’affichage des rendez-vous du compte de l’utilisateur', async () => {
    expect(await regler(true)).toEqual(success(undefined))
  })

  it('refuse le réglage tant qu’aucun compte RDV n’est connecté', async () => {
    expect(await regler(false)).toEqual(
      failure({ _tag: 'CompteRdvIntrouvable' }),
    )
  })
})
