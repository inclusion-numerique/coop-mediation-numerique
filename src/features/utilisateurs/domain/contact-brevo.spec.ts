import { describe, expect, it } from 'vitest'
import { situationDansLeDispositif } from './contact-brevo'
import { Dispositif } from './dispositif'

describe('situation d’un inscrit dans le dispositif', () => {
  it.each<{
    cas: string
    dispositif: Dispositif
    coordinateurDeclare: boolean
    situation: string
  }>([
    {
      cas: 'ignore une déclaration de coordinateur hors dispositif',
      dispositif: Dispositif('HorsDispositif'),
      coordinateurDeclare: true,
      situation: 'HorsDispositif',
    },
    {
      cas: 'reconnaît un conseiller numérique',
      dispositif: Dispositif('ConseillerNumerique'),
      coordinateurDeclare: false,
      situation: 'ConseillerNumerique',
    },
    {
      cas: 'reconnaît un coordinateur déclaré dans le dispositif',
      dispositif: Dispositif('ConseillerNumerique'),
      coordinateurDeclare: true,
      situation: 'CoordinateurDuDispositif',
    },
  ])('$cas', ({ dispositif, coordinateurDeclare, situation }) => {
    expect(situationDansLeDispositif(dispositif, coordinateurDeclare)).toBe(
      situation,
    )
  })
})
