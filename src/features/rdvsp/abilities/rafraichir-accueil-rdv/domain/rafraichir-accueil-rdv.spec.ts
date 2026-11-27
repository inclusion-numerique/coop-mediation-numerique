import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import type {
  DemandeurDuRafraichissement,
  RafraichirAccueilRdvPorts,
} from './ports'
import { rafraichirAccueilRdv } from './rafraichir-accueil-rdv'

const utilisateurId = UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c')
const maintenant = new Date('2026-09-01T10:00:00.000Z')
const widget = 'widget relu'

const ports: RafraichirAccueilRdvPorts<string> = {
  declencher: async () => success({ derive: 2 }),
  consulter: async () => success({ widget }),
}

const demandeur: DemandeurDuRafraichissement = {
  id: utilisateurId,
  role: 'User',
}

const demande = { demandeur, maintenant }

describe('rafraîchir le bloc rendez-vous de l’accueil', () => {
  it('relit l’accueil quand le rattrapage a changé quelque chose', async () => {
    expect(await rafraichirAccueilRdv(ports)(demande)).toEqual(
      success({ _tag: 'rafraichi', derive: 2, widget }),
    )
  })

  it('laisse l’accueil inchangé quand le rattrapage n’a rien changé', async () => {
    expect(
      await rafraichirAccueilRdv({
        ...ports,
        declencher: async () => success({ derive: 0 }),
      })(demande),
    ).toEqual(success({ _tag: 'inchange' }))
  })

  it('rend l’échec du rattrapage', async () => {
    expect(
      await rafraichirAccueilRdv({
        ...ports,
        declencher: async () => failure({ _tag: 'NonAutorise' }),
      })(demande),
    ).toEqual(failure({ _tag: 'NonAutorise' }))
  })
})
