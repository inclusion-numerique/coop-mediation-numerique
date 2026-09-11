import {
  Adresse,
  Localisation,
  Nom,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Fiche } from '../../../domain/fiche'
import {
  adresseDeLInscription,
  ficheDuRegistre,
  type InscriptionPourLaFiche,
} from './fiche-du-registre'

const adresseDuRegistre = {
  numeroVoie: 12,
  repetition: null,
  nomVoie: 'rue Foch',
  nomCommune: 'Reims',
  codePostal: '51100',
  codeInsee: '51454',
  codeBan: null,
}

const inscription = (
  surcharge: Partial<InscriptionPourLaFiche> = {},
): InscriptionPourLaFiche => ({
  nom: 'Espace numérique',
  nomUsage: null,
  complementAdresse: null,
  visiblePourCartographieNationale: true,
  ficheAccesLibre: null,
  priseRdv: null,
  horaires: null,
  presentationResume: null,
  presentationDetail: null,
  siretALEnrichissement: null,
  structureCartographieNationaleId: null,
  contact: {},
  typologies: [],
  services: [],
  publicsSpecifiquementAdresses: [],
  priseEnChargeSpecifique: [],
  modalitesAcces: [],
  fraisACharge: [],
  itinerance: [],
  dispositifProgrammesNationaux: [],
  formationsLabels: [],
  autresFormationsLabels: [],
  modalitesAccompagnement: [],
  source: null,
  updatedAtCarto: null,
  updatedAtCoop: null,
  updatedAtMin: null,
  adresse: adresseDuRegistre,
  ...surcharge,
})

const adresseCoop = Adresse({
  voie: '3 place Royale',
  commune: 'Reims',
  code_postal: '51100',
})

const depuisLaCoop: Pick<Fiche, 'pivot' | 'localisation' | 'adresse'> = {
  pivot: null,
  localisation: Localisation({ latitude: 49.25, longitude: 4.03 }),
  adresse: adresseCoop,
}

describe('l’adresse que porte une inscription', () => {
  it('recompose la voie que l’Entrepôt éclate', () => {
    expect(adresseDeLInscription(inscription())?.voie).toBe('12 rue Foch')
  })

  it('y joint le complément quand la coop en a posé un', () => {
    expect(
      adresseDeLInscription(inscription({ complementAdresse: 'Bâtiment C' }))
        ?.complement_adresse,
    ).toBe('Bâtiment C')
  })

  it('ne rend rien quand l’inscription n’est reliée à aucune adresse', () => {
    expect(adresseDeLInscription(inscription({ adresse: null }))).toBeNull()
  })

  it('ne rend rien d’une adresse que le standard refuse', () => {
    expect(
      adresseDeLInscription(
        inscription({
          adresse: { ...adresseDuRegistre, numeroVoie: null, nomVoie: null },
        }),
      ),
    ).toBeNull()
  })
})

describe('la fiche que le registre décrit', () => {
  it('prend le nom du registre', () => {
    expect(ficheDuRegistre(inscription(), depuisLaCoop).nom).toBe(
      Nom('Espace numérique'),
    )
  })

  it('prend l’adresse du registre quand il en porte une', () => {
    expect(ficheDuRegistre(inscription(), depuisLaCoop).adresse?.voie).toBe(
      '12 rue Foch',
    )
  })

  it('garde celle de la coop quand le registre n’en porte pas', () => {
    expect(
      ficheDuRegistre(inscription({ adresse: null }), depuisLaCoop).adresse,
    ).toBe(adresseCoop)
  })

  it('tient de la coop ce que le registre ne porte pas', () => {
    const fiche = ficheDuRegistre(inscription(), depuisLaCoop)

    expect(fiche.pivot).toBeNull()
    expect(fiche.localisation).toEqual({ latitude: 49.25, longitude: 4.03 })
  })

  it('assemble la présentation de ses deux colonnes', () => {
    expect(
      ficheDuRegistre(
        inscription({
          presentationResume: 'Un résumé',
          presentationDetail: 'Un détail',
        }),
        depuisLaCoop,
      ).presentation,
    ).toEqual({ resume: 'Un résumé', detail: 'Un détail' })
  })

  it('ne présente rien quand les deux colonnes sont vides', () => {
    expect(
      ficheDuRegistre(
        inscription({ presentationResume: '  ', presentationDetail: null }),
        depuisLaCoop,
      ).presentation,
    ).toBeNull()
  })

  it('garde les liens que le standard reconnaît et laisse tomber les autres', () => {
    const fiche = ficheDuRegistre(
      inscription({
        ficheAccesLibre: 'https://acceslibre.fr/fiche',
        priseRdv: 'appelez-nous',
      }),
      depuisLaCoop,
    )

    expect(fiche.ficheAccesLibre).toBe(Url('https://acceslibre.fr/fiche'))
    expect(fiche.priseRdv).toBeNull()
  })

  it('ne retient pas des horaires qui ne disent rien', () => {
    expect(
      ficheDuRegistre(inscription({ horaires: '   ' }), depuisLaCoop).horaires,
    ).toBeNull()
  })

  it('traduit les nomenclatures du registre vers celles du standard', () => {
    const fiche = ficheDuRegistre(
      inscription({ services: ['AideAuxDemarchesAdministratives'] }),
      depuisLaCoop,
    )

    expect(fiche.services).toEqual(['Aide aux démarches administratives'])
  })
})
