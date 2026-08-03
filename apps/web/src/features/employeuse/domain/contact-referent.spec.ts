import { ContactReferent } from './contact-referent'

describe('ContactReferent', () => {
  it('assemble nom et prénom et retient le référent hiérarchique', () => {
    expect(
      ContactReferent({
        nom: 'Moustaki',
        prenom: 'Georges',
        telephone: '0102030405',
        courriels: {
          mail_gestionnaire: 'gestion@structure.fr',
          referent_hierarchique: 'georges@structure.fr',
        },
      }),
    ).toEqual({
      _tag: 'renseigne',
      nom: 'Moustaki Georges',
      courriel: 'georges@structure.fr',
      telephone: '0102030405',
    })
  })

  it('retombe sur le gestionnaire puis sur le premier courriel disponible', () => {
    expect(
      ContactReferent({ courriels: { mail_gestionnaire: 'gestion@x.fr' } }),
    ).toMatchObject({ courriel: 'gestion@x.fr' })

    expect(
      ContactReferent({ courriels: { autre: 'autre@x.fr' } }),
    ).toMatchObject({ courriel: 'autre@x.fr' })
  })

  it('n’est pas renseigné quand le contact est vide, absent ou sans information', () => {
    expect(ContactReferent(null)).toEqual({ _tag: 'nonRenseigne' })
    expect(ContactReferent({})).toEqual({ _tag: 'nonRenseigne' })
    expect(ContactReferent({ nom: '   ' })).toEqual({ _tag: 'nonRenseigne' })
  })

  // Le jsonb vient des producteurs Dataspace : sa forme n'est pas garantie.
  // L'ancien `contact as MainContact` la promettait sans jamais la vérifier.
  it('résiste à un jsonb de forme inattendue', () => {
    expect(ContactReferent('une chaîne')).toEqual({ _tag: 'nonRenseigne' })
    expect(ContactReferent([1, 2, 3])).toEqual({ _tag: 'nonRenseigne' })
    expect(ContactReferent({ nom: 42, telephone: true })).toEqual({
      _tag: 'nonRenseigne',
    })
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
    ).toMatchObject({ courriel: null })
  })
})
