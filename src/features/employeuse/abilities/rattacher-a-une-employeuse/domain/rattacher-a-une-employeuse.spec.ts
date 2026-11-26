import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { EmployeuseId } from '../../../domain/employeuse-id'
import { IdentiteEmployeuse } from '../../../domain/identite-employeuse'
import type { EmployeuseDuSiret } from './employeuse-du-siret'
import { EmployeuseIndisponible } from './errors'
import type { RattacherAUneEmployeusePorts } from './ports'
import { rattacherAUneEmployeuse } from './rattacher-a-une-employeuse'
import type { SaisieEmployeuse } from './source-du-rattachement'

const userId = '550e8400-e29b-41d4-a716-446655440000'

const employeuseCreeeId = EmployeuseId(7)

const employeuseExistanteId = EmployeuseId(3)

const saisie: SaisieEmployeuse = {
  siret: '93429789600011',
  denomination: 'Association des tests',
  adresse: {
    voie: '10 rue de la Bascule',
    commune: 'Nantes',
    codePostal: '44000',
    codeInsee: '44109',
  },
}

const identiteSaisie = IdentiteEmployeuse({
  siret: '93429789600011',
  denomination: 'Association des tests',
  adresse: {
    voie: '10 rue de la Bascule',
    commune: 'Nantes',
    codePostal: '44000',
    codeInsee: '44109',
  },
})

const identiteSirene = IdentiteEmployeuse({
  siret: '93429789600011',
  denomination: 'ASSOCIATION SIRENE',
  adresse: {
    voie: '1 rue du Registre',
    commune: 'Paris',
    codePostal: '75001',
    codeInsee: '75101',
  },
})

const ports: RattacherAUneEmployeusePorts = {
  lireLEtablissement: async () =>
    success({
      siret: '93429789600011',
      raisonSociale: 'ASSOCIATION SIRENE',
      ferme: false,
      voie: '1 rue du Registre',
      commune: 'Paris',
      codePostal: '75001',
      codeInsee: '75101',
    }),
  estConseillerNumeriqueEnPoste: async () => false,
  lireLesEmployeusesDuSiret: async () => success([]),
  creerLEmployeuse: async () => success(employeuseCreeeId),
  enregistrerLeRattachement: async () => undefined,
}

const homonymes = (
  employeuses: readonly EmployeuseDuSiret[],
): RattacherAUneEmployeusePorts => ({
  ...ports,
  lireLesEmployeusesDuSiret: async () => success(employeuses),
})

describe('rattacher à une employeuse saisie', () => {
  it('crée l’employeuse que rien ne désigne encore puis y rattache l’utilisateur', async () => {
    expect(
      await rattacherAUneEmployeuse(ports)({
        userId,
        source: { _tag: 'Saisie', saisie },
      }),
    ).toEqual(
      success({
        _tag: 'Rattachee',
        userId,
        employeuseId: employeuseCreeeId,
        employeuseCreee: identiteSaisie,
      }),
    )
  })

  it.each<{ cas: string; employeuses: readonly EmployeuseDuSiret[] }>([
    {
      cas: 'reprend l’employeuse dont l’antenne porte la dénomination saisie',
      employeuses: [
        {
          id: employeuseExistanteId,
          denominationAntenne: ' association des TESTS ',
          denominationSirene: null,
        },
      ],
    },
    {
      cas: 'reprend l’employeuse dont seule la dénomination SIRENE porte le nom saisi',
      employeuses: [
        {
          id: employeuseExistanteId,
          denominationAntenne: null,
          denominationSirene: 'Association des tests',
        },
      ],
    },
    {
      cas: 'préfère l’antenne à la dénomination SIRENE',
      employeuses: [
        {
          id: EmployeuseId(9),
          denominationAntenne: 'Antenne de Rennes',
          denominationSirene: 'Association des tests',
        },
        {
          id: employeuseExistanteId,
          denominationAntenne: 'Association des tests',
          denominationSirene: null,
        },
      ],
    },
  ])('$cas', async ({ employeuses }) => {
    expect(
      await rattacherAUneEmployeuse(homonymes(employeuses))({
        userId,
        source: { _tag: 'Saisie', saisie },
      }),
    ).toEqual(
      success({
        _tag: 'Rattachee',
        userId,
        employeuseId: employeuseExistanteId,
        employeuseCreee: null,
      }),
    )
  })

  it('crée l’antenne que les autres lignes du SIRET ne désignent pas', async () => {
    expect(
      await rattacherAUneEmployeuse(
        homonymes([
          {
            id: employeuseExistanteId,
            denominationAntenne: 'Antenne de Rennes',
            denominationSirene: 'Fédération des tests',
          },
        ]),
      )({ userId, source: { _tag: 'Saisie', saisie } }),
    ).toEqual(
      success({
        _tag: 'Rattachee',
        userId,
        employeuseId: employeuseCreeeId,
        employeuseCreee: identiteSaisie,
      }),
    )
  })

  it('crée une employeuse sans dénomination, qu’aucune ligne ne peut désigner', async () => {
    expect(
      await rattacherAUneEmployeuse(
        homonymes([
          {
            id: employeuseExistanteId,
            denominationAntenne: null,
            denominationSirene: null,
          },
        ]),
      )({
        userId,
        source: { _tag: 'Saisie', saisie: { ...saisie, denomination: null } },
      }),
    ).toEqual(
      success({
        _tag: 'Rattachee',
        userId,
        employeuseId: employeuseCreeeId,
        employeuseCreee: IdentiteEmployeuse({
          siret: '93429789600011',
          denomination: null,
          adresse: saisie.adresse,
        }),
      }),
    )
  })

  it('refuse une saisie sans commune', async () => {
    expect(
      await rattacherAUneEmployeuse(ports)({
        userId,
        source: {
          _tag: 'Saisie',
          saisie: { ...saisie, adresse: { ...saisie.adresse, commune: '' } },
        },
      }),
    ).toEqual(failure({ _tag: 'IdentiteInexploitable' }))
  })

  it('échoue quand les employeuses du SIRET ne peuvent pas être lues', async () => {
    expect(
      await rattacherAUneEmployeuse({
        ...ports,
        lireLesEmployeusesDuSiret: async () =>
          failure(EmployeuseIndisponible()),
      })({ userId, source: { _tag: 'Saisie', saisie } }),
    ).toEqual(failure({ _tag: 'EmployeuseIndisponible' }))
  })

  it('échoue quand l’employeuse ne peut pas être créée', async () => {
    expect(
      await rattacherAUneEmployeuse({
        ...ports,
        creerLEmployeuse: async () => failure(EmployeuseIndisponible()),
      })({ userId, source: { _tag: 'Saisie', saisie } }),
    ).toEqual(failure({ _tag: 'EmployeuseIndisponible' }))
  })
})

describe('rattacher à l’employeuse d’un SIRET', () => {
  it('rattache à l’identité que SIRENE décrit', async () => {
    expect(
      await rattacherAUneEmployeuse(ports)({
        userId,
        source: { _tag: 'Siret', siret: '93429789600011' },
      }),
    ).toEqual(
      success({
        _tag: 'Rattachee',
        userId,
        employeuseId: employeuseCreeeId,
        employeuseCreee: identiteSirene,
      }),
    )
  })

  it('échoue quand SIRENE ne répond pas', async () => {
    expect(
      await rattacherAUneEmployeuse({
        ...ports,
        lireLEtablissement: async () => failure(EmployeuseIndisponible()),
      })({ userId, source: { _tag: 'Siret', siret: '93429789600011' } }),
    ).toEqual(failure({ _tag: 'EmployeuseIndisponible' }))
  })

  it('refuse un établissement fermé', async () => {
    expect(
      await rattacherAUneEmployeuse({
        ...ports,
        lireLEtablissement: async () =>
          success({
            siret: '93429789600011',
            raisonSociale: 'ASSOCIATION SIRENE',
            ferme: true,
            voie: '1 rue du Registre',
            commune: 'Paris',
            codePostal: '75001',
            codeInsee: '75101',
          }),
      })({ userId, source: { _tag: 'Siret', siret: '93429789600011' } }),
    ).toEqual(failure({ _tag: 'IdentiteInexploitable' }))
  })
})

describe('rattacher à l’employeuse déclarée par ProConnect', () => {
  it('rattache un médiateur à l’employeuse de son SIRET', async () => {
    expect(
      await rattacherAUneEmployeuse(ports)({
        userId,
        source: { _tag: 'ProConnect', siret: '93429789600011' },
      }),
    ).toEqual(
      success({
        _tag: 'Rattachee',
        userId,
        employeuseId: employeuseCreeeId,
        employeuseCreee: identiteSirene,
      }),
    )
  })

  it('ne rattache rien sans SIRET', async () => {
    expect(
      await rattacherAUneEmployeuse(ports)({
        userId,
        source: { _tag: 'ProConnect', siret: null },
      }),
    ).toEqual(success({ _tag: 'SansRattachement', motif: 'SiretAbsent' }))
  })

  it('ne rattache pas un conseiller numérique en poste, dont le dispositif fixe l’employeuse', async () => {
    expect(
      await rattacherAUneEmployeuse({
        ...ports,
        estConseillerNumeriqueEnPoste: async () => true,
      })({ userId, source: { _tag: 'ProConnect', siret: '93429789600011' } }),
    ).toEqual(
      success({
        _tag: 'SansRattachement',
        motif: 'ConseillerNumeriqueEnPoste',
      }),
    )
  })

  it('échoue pour un utilisateur inconnu', async () => {
    expect(
      await rattacherAUneEmployeuse({
        ...ports,
        estConseillerNumeriqueEnPoste: async () => null,
      })({ userId, source: { _tag: 'ProConnect', siret: '93429789600011' } }),
    ).toEqual(failure({ _tag: 'UtilisateurIntrouvable' }))
  })
})
