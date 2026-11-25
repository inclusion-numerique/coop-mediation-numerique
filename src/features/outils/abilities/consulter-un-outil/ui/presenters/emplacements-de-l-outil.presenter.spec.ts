import { describe, expect, it } from 'vitest'
import { SlugOutil } from '../../domain/index'
import { emplacementsDeLOutil } from './emplacements-de-l-outil.presenter'

const fournisseurs = {
  'rdv-service-public': async () => ({ avis: 'migration', acces: 'accès' }),
}

describe('emplacements de la fiche d’un outil', () => {
  it('confie les emplacements de l’outil à son fournisseur', async () => {
    expect(
      await emplacementsDeLOutil(SlugOutil('rdv-service-public'), fournisseurs),
    ).toEqual({ avis: 'migration', acces: 'accès' })
  })

  it('laisse vides les emplacements d’un outil sans fournisseur', async () => {
    expect(await emplacementsDeLOutil(SlugOutil('pix'), fournisseurs)).toEqual(
      {},
    )
  })
})
