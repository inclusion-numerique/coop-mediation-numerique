import type { UniteLegale } from '@app/web/external-apis/apiEntrepriseApiModels'
import { structureCreationDataWithSiretFromUniteLegale } from './structuresInfoFromUniteLegale'

// Réponse de l'API Recherche d'entreprises réduite à ce que l'adaptateur lit.
const uniteLegale = (
  etablissement: Partial<UniteLegale['matching_etablissements'][number]>,
): UniteLegale =>
  ({
    nom_raison_sociale: 'FONDATION NATIONALE DES SCIENCES POLITIQUES',
    nom_complet: 'FONDATION NATIONALE DES SCIENCES POLITIQUES',
    matching_etablissements: [
      {
        adresse: '27 RUE SAINT-GUILLAUME 75007 PARIS',
        code_postal: '75007',
        commune: '75107',
        libelle_commune: 'PARIS',
        est_siege: true,
        etat_administratif: 'A',
        siret: '78430824900019',
        ...etablissement,
      },
    ],
  }) as unknown as UniteLegale

describe('structureCreationDataWithSiretFromUniteLegale', () => {
  // Cas de production : le code postal était le seul composant d'adresse jamais
  // repris. Vide, il remontait jusqu'à `main.adresse`, et `AdresseEmployeuse`
  // étant totale, l'employeuse s'affichait sans AUCUNE adresse.
  it('reprend le code postal de l’établissement', () => {
    expect(
      structureCreationDataWithSiretFromUniteLegale(uniteLegale({})),
    ).toMatchObject([{ siret: '78430824900019', codePostal: '75007' }])
  })

  it('rend une chaîne vide quand l’API n’a pas de code postal', () => {
    expect(
      structureCreationDataWithSiretFromUniteLegale(
        uniteLegale({ code_postal: undefined }),
      ),
    ).toMatchObject([{ codePostal: '' }])
  })

  // L'API rend l'adresse en une seule chaîne, localité comprise. Conservée
  // telle quelle, elle donnait « 27 Rue Saint-Guillaume 75007 Paris, 75007
  // Paris » à l'affichage et faisait échouer le géocodage BAN.
  it('retire du libellé de voie le code postal et la commune que l’API répète', () => {
    expect(
      structureCreationDataWithSiretFromUniteLegale(uniteLegale({})),
    ).toMatchObject([{ adresse: '27 Rue Saint-Guillaume' }])
  })

  it('laisse intacte une adresse qui ne se termine pas par la localité', () => {
    expect(
      structureCreationDataWithSiretFromUniteLegale(
        uniteLegale({ adresse: '27 RUE SAINT-GUILLAUME CEDEX 07' }),
      ),
    ).toMatchObject([{ adresse: '27 Rue Saint-Guillaume Cedex 07' }])
  })

  it('ne vide pas la voie quand l’adresse se réduit à la localité', () => {
    expect(
      structureCreationDataWithSiretFromUniteLegale(
        uniteLegale({ adresse: '75007 PARIS' }),
      ),
    ).toMatchObject([{ adresse: '75007 Paris' }])
  })

  it('écarte les établissements fermés', () => {
    expect(
      structureCreationDataWithSiretFromUniteLegale(
        uniteLegale({ etat_administratif: 'F' }),
      ),
    ).toEqual([])
  })
})
