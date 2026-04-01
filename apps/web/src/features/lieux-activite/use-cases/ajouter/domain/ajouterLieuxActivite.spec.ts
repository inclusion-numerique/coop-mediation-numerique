import { provide, runWithContainer } from '@app/web/libs/injection'
import {
  clearStores,
  createMediateurEnActivite,
  createStructureFromCarto,
  createStructureFromData,
  findCartoStructure,
  findExistingActivites,
  findStructuresByCartoIds,
  getActivites,
  getStructures,
  seedActivite,
  seedCartoStructure,
  seedStructure,
  seedUserMediateur,
} from '../implementations/inMemory'
import { ajouterLieuxActivite } from './ajouterLieuxActivite'
import {
  CREATE_STRUCTURE_FROM_CARTO_KEY,
  FIND_CARTO_STRUCTURE_KEY,
} from './cartoStructure'
import {
  CREATE_MEDIATEUR_EN_ACTIVITE_KEY,
  FIND_EXISTING_LIEUX_ACTIVITES_KEY,
} from './lieuActivite'
import {
  CREATE_STRUCTURE_FROM_DATA_KEY,
  FIND_STRUCTURES_BY_CARTO_IDS_KEY,
} from './structure'

export const provideInMemoryDependencies = () => {
  provide(FIND_EXISTING_LIEUX_ACTIVITES_KEY, findExistingActivites)
  provide(FIND_STRUCTURES_BY_CARTO_IDS_KEY, findStructuresByCartoIds)
  provide(FIND_CARTO_STRUCTURE_KEY, findCartoStructure)
  provide(CREATE_STRUCTURE_FROM_DATA_KEY, createStructureFromData)
  provide(CREATE_STRUCTURE_FROM_CARTO_KEY, createStructureFromCarto)
  provide(CREATE_MEDIATEUR_EN_ACTIVITE_KEY, createMediateurEnActivite)
}

describe('ajouterLieuxActivite', () => {
  beforeEach(() => {
    clearStores()
  })

  describe('when user has no existing activites', () => {
    it('should create activite for lieu with internal id', async () => {
      await runWithContainer(async () => {
        provideInMemoryDependencies()
        seedUserMediateur('user-1', 'mediateur-1')
        seedStructure({
          id: 'existing-structure',
          cartoId: null,
          nom: 'Existing Structure',
          adresse: '1 rue Test',
          commune: 'Paris',
          codePostal: '75001',
        })

        const result = await ajouterLieuxActivite({
          userId: 'user-1',
          mediateurId: 'mediateur-1',
          lieuxActivite: [
            { id: 'existing-structure', nom: 'Existing Structure' },
          ],
        })

        expect(result.newActivites).toHaveLength(1)
        expect(result.newActivites[0].structureId).toBe('existing-structure')
        expect(getActivites().size).toBe(1)
      })
    })

    it('should create structure and activite from form data (API Entreprise)', async () => {
      await runWithContainer(async () => {
        provideInMemoryDependencies()
        seedUserMediateur('user-1', 'mediateur-1')

        const result = await ajouterLieuxActivite({
          userId: 'user-1',
          mediateurId: 'mediateur-1',
          lieuxActivite: [
            {
              nom: 'Croix-Rouge Ancenis',
              siret: '12345678901234',
              adresse: '1 rue de la Paix',
              commune: 'Ancenis',
              codePostal: '44150',
              codeInsee: '44003',
            },
          ],
        })

        expect(result.newActivites).toHaveLength(1)
        expect(getStructures().size).toBe(1)
        expect(getActivites().size).toBe(1)

        const createdStructure = getStructures().get(
          result.newActivites[0].structureId,
        )
        expect(createdStructure?.nom).toBe('Croix-Rouge Ancenis')
        expect(createdStructure?.siret).toBe('12345678901234')
      })
    })

    it('should create structure from CartoStructure when not exists', async () => {
      await runWithContainer(async () => {
        provideInMemoryDependencies()
        seedUserMediateur('user-1', 'mediateur-1')
        seedCartoStructure({
          id: 'carto-123',
          nom: 'Structure Carto',
          adresse: '10 rue Carto',
          commune: 'Lyon',
          codePostal: '69001',
          codeInsee: '69123',
          complementAdresse: null,
          pivot: '12345678901234',
          longitude: null,
          latitude: null,
          ficheAccesLibre: null,
          presentationDetail: null,
          presentationResume: null,
          horaires: null,
          source: null,
          siteWeb: null,
          typologie: null,
          modalitesAccompagnement: null,
          services: null,
          modalitesAcces: null,
          fraisACharge: null,
          itinerance: null,
          priseEnChargeSpecifique: null,
          publicsSpecifiquementAdresses: null,
          courriels: null,
          telephone: null,
        })

        const result = await ajouterLieuxActivite({
          userId: 'user-1',
          mediateurId: 'mediateur-1',
          lieuxActivite: [
            {
              structureCartographieNationaleId: 'carto-123',
              nom: 'Structure Carto',
            },
          ],
        })

        expect(result.newActivites).toHaveLength(1)
        expect(getStructures().size).toBe(1)

        const createdStructure = getStructures().get(
          result.newActivites[0].structureId,
        )
        expect(createdStructure?.nom).toBe('Structure Carto')
        expect(createdStructure?.cartoId).toBe('carto-123')
      })
    })

    it('should link to existing structure when cartoId already has structure', async () => {
      await runWithContainer(async () => {
        provideInMemoryDependencies()
        seedUserMediateur('user-1', 'mediateur-1')
        seedStructure({
          id: 'existing-from-carto',
          cartoId: 'carto-456',
          nom: 'Existing Carto Structure',
          adresse: '5 rue Existante',
          commune: 'Marseille',
          codePostal: '13001',
        })

        const result = await ajouterLieuxActivite({
          userId: 'user-1',
          mediateurId: 'mediateur-1',
          lieuxActivite: [
            {
              structureCartographieNationaleId: 'carto-456',
              nom: 'Existing Carto Structure',
            },
          ],
        })

        expect(result.newActivites).toHaveLength(1)
        expect(result.newActivites[0].structureId).toBe('existing-from-carto')
        expect(getStructures().size).toBe(1)
      })
    })
  })

  describe('when user has existing activites', () => {
    it('should skip lieu already linked to user', async () => {
      await runWithContainer(async () => {
        provideInMemoryDependencies()
        seedUserMediateur('user-1', 'mediateur-1')
        seedStructure({
          id: 'already-linked',
          cartoId: null,
          nom: 'Already Linked',
          adresse: '1 rue Test',
          commune: 'Paris',
          codePostal: '75001',
        })
        seedActivite({
          id: 'existing-activite',
          mediateurId: 'mediateur-1',
          structureId: 'already-linked',
          userId: 'user-1',
        })

        const result = await ajouterLieuxActivite({
          userId: 'user-1',
          mediateurId: 'mediateur-1',
          lieuxActivite: [{ id: 'already-linked', nom: 'Already Linked' }],
        })

        expect(result.newActivites).toHaveLength(0)
        expect(getActivites().size).toBe(1)
      })
    })

    it('should process new lieux while skipping already linked', async () => {
      await runWithContainer(async () => {
        provideInMemoryDependencies()
        seedUserMediateur('user-1', 'mediateur-1')
        seedStructure({
          id: 'already-linked',
          cartoId: null,
          nom: 'Already Linked',
          adresse: '1 rue Test',
          commune: 'Paris',
          codePostal: '75001',
        })
        seedStructure({
          id: 'new-structure',
          cartoId: null,
          nom: 'New Structure',
          adresse: '2 rue Test',
          commune: 'Lyon',
          codePostal: '69001',
        })
        seedActivite({
          id: 'existing-activite',
          mediateurId: 'mediateur-1',
          structureId: 'already-linked',
          userId: 'user-1',
        })

        const result = await ajouterLieuxActivite({
          userId: 'user-1',
          mediateurId: 'mediateur-1',
          lieuxActivite: [
            { id: 'already-linked', nom: 'Already Linked' },
            { id: 'new-structure', nom: 'New Structure' },
          ],
        })

        expect(result.newActivites).toHaveLength(1)
        expect(result.newActivites[0].structureId).toBe('new-structure')
        expect(getActivites().size).toBe(2)
      })
    })
  })

  describe('mixed scenarios', () => {
    it('should handle multiple lieux with different cases', async () => {
      await runWithContainer(async () => {
        provideInMemoryDependencies()
        seedUserMediateur('user-1', 'mediateur-1')
        seedStructure({
          id: 'existing-internal',
          cartoId: null,
          nom: 'Existing Internal',
          adresse: '1 rue Test',
          commune: 'Paris',
          codePostal: '75001',
        })
        seedStructure({
          id: 'existing-carto',
          cartoId: 'carto-existing',
          nom: 'Existing Carto',
          adresse: '2 rue Test',
          commune: 'Lyon',
          codePostal: '69001',
        })
        seedCartoStructure({
          id: 'carto-new',
          nom: 'New Carto Structure',
          adresse: '3 rue Test',
          commune: 'Marseille',
          codePostal: '13001',
          codeInsee: '13055',
          complementAdresse: null,
          pivot: '98765432109876',
          longitude: null,
          latitude: null,
          ficheAccesLibre: null,
          presentationDetail: null,
          presentationResume: null,
          horaires: null,
          source: null,
          siteWeb: null,
          typologie: null,
          modalitesAccompagnement: null,
          services: null,
          modalitesAcces: null,
          fraisACharge: null,
          itinerance: null,
          priseEnChargeSpecifique: null,
          publicsSpecifiquementAdresses: null,
          courriels: null,
          telephone: null,
        })

        const result = await ajouterLieuxActivite({
          userId: 'user-1',
          mediateurId: 'mediateur-1',
          lieuxActivite: [
            { id: 'existing-internal', nom: 'Existing Internal' },
            {
              nom: 'From API',
              siret: '999',
              adresse: 'API addr',
              commune: 'API',
              codePostal: '00000',
            },
            {
              structureCartographieNationaleId: 'carto-existing',
              nom: 'Existing Carto',
            },
            {
              structureCartographieNationaleId: 'carto-new',
              nom: 'New Carto Structure',
            },
          ],
        })

        expect(result.newActivites).toHaveLength(4)
        expect(getActivites().size).toBe(4)
        expect(getStructures().size).toBe(4)
      })
    })

    it('should return empty when no lieux provided', async () => {
      await runWithContainer(async () => {
        provideInMemoryDependencies()
        seedUserMediateur('user-1', 'mediateur-1')

        const result = await ajouterLieuxActivite({
          userId: 'user-1',
          mediateurId: 'mediateur-1',
          lieuxActivite: [],
        })

        expect(result.newActivites).toHaveLength(0)
      })
    })
  })
})
