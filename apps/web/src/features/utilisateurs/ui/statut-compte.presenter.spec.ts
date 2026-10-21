import type { StatutCompte } from '../domain'
import { libelleDuStatut, severiteDuStatut } from './statut-compte.presenter'

describe('présentation du statut d’un compte', () => {
  it.each<[StatutCompte, string, string]>([
    [{ _tag: 'Supprime' }, 'Supprimé', 'error'],
    [{ _tag: 'Administrateur' }, 'Admin', 'info'],
    [{ _tag: 'Support' }, 'Support', 'info'],
    [{ _tag: 'InscriptionEnCours', palier: 0 }, 'Inscription en cours', 'new'],
    [
      { _tag: 'InscriptionEnCours', palier: 7 },
      'Inscription en cours J+7',
      'new',
    ],
    [
      { _tag: 'InscriptionEnCours', palier: 60 },
      'Inscription en cours J+60',
      'warning',
    ],
    [
      { _tag: 'InscriptionEnCours', palier: 90 },
      'Inscription en cours J+90',
      'error',
    ],
    [{ _tag: 'Nouveau', palier: 0 }, 'Nouveau', 'info'],
    [{ _tag: 'Nouveau', palier: 30 }, 'Nouveau J+30', 'warning'],
    [{ _tag: 'Nouveau', palier: 90 }, 'Nouveau J+90', 'error'],
    [{ _tag: 'Actif' }, 'Actif', 'success'],
    [{ _tag: 'Inactif', palier: 30 }, 'Inactif J+30', 'warning'],
    [{ _tag: 'Inactif', palier: 180 }, 'Inactif J+180', 'error'],
  ])('%o : « %s », %s', (statut, libelle, severite) => {
    expect(libelleDuStatut(statut)).toBe(libelle)
    expect(severiteDuStatut(statut)).toBe(severite)
  })
})
