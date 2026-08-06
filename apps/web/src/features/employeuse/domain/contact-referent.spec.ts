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

  // Cas de production : le jsonb porte deux adresses distinctes et un seul nom,
  // celui du gestionnaire. Servir le référent hiérarchique affichait « OLIVE
  // René » avec l'adresse de quelqu'un d'autre (SA 5292, mesuré sur 746 des
  // 3 351 utilisateurs actifs).
  it('sert le gestionnaire quand les deux courriels désignent des personnes différentes', () => {
    expect(
      ContactReferent({
        nom: 'OLIVE',
        prenom: 'René',
        courriels: {
          mail_gestionnaire: 's.pena@cc-aspres.fr',
          referent_hierarchique: 's.vignettes@cc-aspres.fr',
        },
      }),
    ).toMatchObject({ nom: 'René OLIVE', courriel: 's.pena@cc-aspres.fr' })
  })

  it('retombe sur le référent hiérarchique puis sur le premier courriel disponible', () => {
    expect(
      ContactReferent({
        courriels: { referent_hierarchique: 'hierarchie@x.fr' },
      }),
    ).toMatchObject({ courriel: 'hierarchie@x.fr' })

    expect(
      ContactReferent({ courriels: { autre: 'autre@x.fr' } }),
    ).toMatchObject({ courriel: 'autre@x.fr' })
  })

  // Un gestionnaire malformé ne doit pas priver l'affichage du référent
  // hiérarchique, qui lui est valide.
  it('passe au référent hiérarchique quand le gestionnaire n’est pas une adresse', () => {
    expect(
      ContactReferent({
        nom: 'Piaf',
        courriels: {
          mail_gestionnaire: 'pas-une-adresse',
          referent_hierarchique: 'edith@structure.fr',
        },
      }),
    ).toMatchObject({ courriel: 'edith@structure.fr' })
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

describe('referentAffichage', () => {
  // Cas de production : 644 employeuses n'ont ni nom ni prénom dans leur jsonb
  // mais bien un courriel ou un téléphone. Conditionner l'affichage au nom
  // masquait leur bloc contact entier.
  it('signale un référent joignable même sans nom', () => {
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
