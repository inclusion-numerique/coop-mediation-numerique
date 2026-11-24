import { describe, expect, it } from 'vitest'
import { auteurDeLExport } from './auteur-de-l-export.presenter'

const utilisateur = {
  firstName: 'Anne',
  lastName: 'Dupont',
  role: 'User',
  isConseillerNumerique: false,
  mediateur: { id: 'mediateur-1' },
  coordinateur: null,
}

describe('auteur de l’export', () => {
  it('reprend le nom, le prénom et le libellé du rôle', () => {
    expect(auteurDeLExport(utilisateur)).toEqual({
      nom: 'Dupont',
      prenom: 'Anne',
      role: 'Médiateur',
    })
  })

  it('nomme le rôle d’un administrateur', () => {
    expect(auteurDeLExport({ ...utilisateur, role: 'Admin' }).role).toBe(
      'Administrateur',
    )
  })
})
