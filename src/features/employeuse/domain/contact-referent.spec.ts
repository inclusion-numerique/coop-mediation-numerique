import { describe, expect, it } from 'vitest'
import { ContactReferent, referentAffichage } from './contact-referent'

describe('ContactReferent', () => {
  it('assemble prénom puis nom et retient le gestionnaire', () => {
    expect(
      ContactReferent({
        nom: 'Moustaki',
        prenom: 'Georges',
        telephone: '0102030405',
        courriels: {
          mail_gestionnaire: 'georges@structure.fr',
          referent_hierarchique: 'hierarchie@structure.fr',
        },
      }),
    ).toEqual({
      _tag: 'renseigne',
      nom: 'Georges Moustaki',
      courriel: 'georges@structure.fr',
      telephone: '0102030405',
    })
  })

  it('sert le gestionnaire, seul à porter le nom, quand les deux courriels désignent des personnes différentes', () => {
    expect(
      ContactReferent({
        nom: 'OLIVE',
        prenom: 'René',
        courriels: {
          mail_gestionnaire: 's.pena@cc-aspres.fr',
          referent_hierarchique: 's.vignettes@cc-aspres.fr',
        },
      }),
    ).toEqual({
      _tag: 'renseigne',
      nom: 'René OLIVE',
      courriel: 's.pena@cc-aspres.fr',
      telephone: null,
    })
  })

  it('retombe sur le référent hiérarchique sans gestionnaire', () => {
    expect(
      ContactReferent({
        courriels: { referent_hierarchique: 'hierarchie@x.fr' },
      }),
    ).toEqual({
      _tag: 'renseigne',
      nom: null,
      courriel: 'hierarchie@x.fr',
      telephone: null,
    })
  })

  it('retombe sur le premier courriel disponible sans gestionnaire ni référent hiérarchique', () => {
    expect(ContactReferent({ courriels: { autre: 'autre@x.fr' } })).toEqual({
      _tag: 'renseigne',
      nom: null,
      courriel: 'autre@x.fr',
      telephone: null,
    })
  })

  it('passe au référent hiérarchique valide quand le gestionnaire n’est pas une adresse', () => {
    expect(
      ContactReferent({
        nom: 'Piaf',
        courriels: {
          mail_gestionnaire: 'pas-une-adresse',
          referent_hierarchique: 'edith@structure.fr',
        },
      }),
    ).toEqual({
      _tag: 'renseigne',
      nom: 'Piaf',
      courriel: 'edith@structure.fr',
      telephone: null,
    })
  })

  it.each<{ cas: string; contact: unknown }>([
    { cas: 'absent', contact: null },
    { cas: 'vide', contact: {} },
    { cas: 'sans information', contact: { nom: '   ' } },
    { cas: 'une chaîne au lieu d’un jsonb objet', contact: 'une chaîne' },
    { cas: 'un tableau au lieu d’un jsonb objet', contact: [1, 2, 3] },
    {
      cas: 'un jsonb aux champs mal typés',
      contact: { nom: 42, telephone: true },
    },
  ])('n’est pas renseigné quand le contact est $cas', ({ contact }) => {
    expect(ContactReferent(contact)).toEqual({ _tag: 'nonRenseigne' })
  })

  it('n’emporte pas le reste du contact quand un seul champ est malformé', () => {
    expect(
      ContactReferent({ nom: 'Piaf', courriels: ['pas', 'un', 'objet'] }),
    ).toEqual({
      _tag: 'renseigne',
      nom: 'Piaf',
      courriel: null,
      telephone: null,
    })
  })

  it('écarte un courriel qui n’en est pas un', () => {
    expect(
      ContactReferent({
        nom: 'Piaf',
        courriels: { referent_hierarchique: 'pas-une-adresse' },
      }),
    ).toEqual({
      _tag: 'renseigne',
      nom: 'Piaf',
      courriel: null,
      telephone: null,
    })
  })
})

describe('referentAffichage', () => {
  it('signale un référent joignable même sans nom, pour ne pas masquer son bloc contact', () => {
    expect(
      referentAffichage(
        ContactReferent({ courriels: { email: 'lelien26@orange.fr' } }),
      ),
    ).toEqual({
      aUnReferent: true,
      nomReferent: null,
      courrielReferent: 'lelien26@orange.fr',
      telephoneReferent: null,
    })
  })

  it('ne signale aucun référent quand le contact est vide', () => {
    expect(referentAffichage(ContactReferent(null))).toEqual({
      aUnReferent: false,
      nomReferent: null,
      courrielReferent: null,
      telephoneReferent: null,
    })
  })
})
