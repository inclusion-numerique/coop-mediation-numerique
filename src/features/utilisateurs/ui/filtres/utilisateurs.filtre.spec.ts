import { describe, expect, it } from 'vitest'
import { AUCUN_FILTRE } from '@/features/utilisateurs/domain'
import {
  filtresDesUtilisateurs,
  filtresUtilisateursDesFiltres,
} from './utilisateurs.filtre'

const lire = (
  parametres: Readonly<Record<string, string | readonly string[]>>,
) => filtresUtilisateursDesFiltres(filtresDesUtilisateurs.charger(parametres))

describe('filtres de la liste des utilisateurs', () => {
  it('ne filtre rien sans paramètre', () => {
    expect(lire({})).toEqual(AUCUN_FILTRE)
  })

  it('lit les listes séparées par des virgules', () => {
    expect(
      lire({
        roles: 'mediateur, coordinateur',
        departements: '75,2A',
        communes: ['75056'],
        employeuses: '12,34',
        lieux: '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f',
      }),
    ).toEqual({
      ...AUCUN_FILTRE,
      roles: ['mediateur', 'coordinateur'],
      departements: ['75', '2A'],
      communes: ['75056'],
      employeuses: [12, 34],
      lieux: ['0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'],
    })
  })

  it('écarte les valeurs invalides sans perdre les autres', () => {
    expect(
      lire({
        roles: 'mediateur,pirate',
        employeuses: 'abc,7',
        lieux: 'pas-un-uuid',
        statut: 'inconnu',
      }),
    ).toEqual({ ...AUCUN_FILTRE, roles: ['mediateur'], employeuses: [7] })
  })

  it.each([
    ['1', 'ConseillerNumerique'],
    ['0', 'HorsDispositif'],
    ['2', null],
  ])('conseiller_numerique=%s donne le dispositif %s', (valeur, dispositif) => {
    expect(lire({ conseiller_numerique: valeur }).dispositif).toBe(dispositif)
  })

  it('ne retient que les rattachements actuels par défaut', () => {
    expect(lire({}).rattachements).toBe('Actuels')
  })

  it('historique=1 inclut les anciens rattachements', () => {
    expect(lire({ historique: '1' }).rattachements).toBe('ActuelsEtAnciens')
  })

  it('lit les coordinateurs et écarte les identifiants invalides', () => {
    expect(
      lire({
        coordinateurs: '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f,pas-un-uuid',
      }).coordinateurs,
    ).toEqual(['0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'])
  })

  it('se réécrit en paramètres d’URL à l’identique', () => {
    const parametres = {
      roles: 'mediateur',
      statut: 'actif',
      conseiller_numerique: '1',
      employeuses: '12',
      coordinateurs: '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f',
      departements: '75',
      historique: '1',
    }

    expect(
      filtresDesUtilisateurs.parametresDe(
        filtresDesUtilisateurs.charger(parametres),
      ),
    ).toEqual(parametres)
  })
})
