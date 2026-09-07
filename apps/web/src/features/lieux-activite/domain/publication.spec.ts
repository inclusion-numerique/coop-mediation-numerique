import { Service } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { publicationSansService, servicesALaPublication } from './publication'

describe('la publication sur la cartographie nationale', () => {
  it('refuse un lieu visible sans service', () => {
    expect(publicationSansService(true, [])).toBe(true)
  })

  it('laisse passer un lieu visible qui annonce un service', () => {
    expect(
      publicationSansService(true, ['AideAuxDemarchesAdministratives']),
    ).toBe(false)
  })

  /** Un lieu qui ne paraît pas sur la cartographie n'a rien à y annoncer. */
  it('ne dit rien d’un lieu non publié', () => {
    expect(publicationSansService(false, [])).toBe(false)
  })

  /** La saisie de création laisse le champ absent tant qu'on n'y touche pas. */
  it.each([[null], [undefined]])(
    'traite %s comme aucun service',
    (services) => {
      expect(publicationSansService(true, services)).toBe(true)
    },
  )
})

describe('les services d’un lieu qu’on rend visible', () => {
  it('reçoit un socle quand le lieu n’en annonçait aucun', () => {
    expect(servicesALaPublication([])).toEqual([
      Service.MaitriseDesOutilsNumeriquesDuQuotidien,
      Service.ComprehensionDuMondeNumerique,
    ])
  })

  // Le socle est un point de départ, jamais une correction : ce que le lieu
  // déclare prime, fût-ce un seul service.
  it('laisse intacts les services déjà déclarés', () => {
    expect(
      servicesALaPublication([Service.AideAuxDemarchesAdministratives]),
    ).toEqual([Service.AideAuxDemarchesAdministratives])
  })
})
