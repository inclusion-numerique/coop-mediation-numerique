import { describe, expect, it } from 'vitest'
import { Siret } from '@/libraries/insee'
import { failure, success } from '@/libraries/result'
import { DenominationEmployeuse } from '../../../domain/denomination-employeuse'
import { EmployeuseId } from '../../../domain/employeuse-id'
import { IdentiteEmployeuse } from '../../../domain/identite-employeuse'
import { UtilisateurId } from '../../../domain/utilisateur-id'
import type { EmployeuseDuSiret } from './employeuse-du-siret'
import { SireneIndisponible } from './errors'
import { MotifSansRattachement } from './motif-sans-rattachement'
import type { RattacherAUneEmployeusePorts } from './ports'
import { rattacherAUneEmployeuse } from './rattacher-a-une-employeuse'

const userId = UtilisateurId('550e8400-e29b-41d4-a716-446655440000')

const siret = Siret('93429789600011')

const employeuseCreeeId = EmployeuseId(7)

const employeuseExistanteId = EmployeuseId(3)

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
    success({ _tag: 'Ouvert', identite: identiteSirene }),
  lireLeStatutDeConseillerNumerique: async () => ({ _tag: 'HorsPoste' }),
  lireLesEmployeusesDuSiret: async () => [],
  creerLEmployeuse: async () => employeuseCreeeId,
  enregistrerLeRattachement: async () => undefined,
}

const homonymes = (
  employeuses: readonly EmployeuseDuSiret[],
): RattacherAUneEmployeusePorts => ({
  ...ports,
  lireLesEmployeusesDuSiret: async () => employeuses,
})

describe('rattacher à une employeuse saisie', () => {
  it('crée l’employeuse que rien ne désigne encore puis y rattache l’utilisateur', async () => {
    expect(
      await rattacherAUneEmployeuse(ports)({
        userId,
        source: { _tag: 'Saisie', identite: identiteSaisie },
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
          denominationAntenne: DenominationEmployeuse(
            ' association des TESTS ',
          ),
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
          denominationSirene: DenominationEmployeuse('Association des tests'),
        },
      ],
    },
    {
      cas: 'préfère l’antenne à la dénomination SIRENE',
      employeuses: [
        {
          id: EmployeuseId(9),
          denominationAntenne: DenominationEmployeuse('Antenne de Rennes'),
          denominationSirene: DenominationEmployeuse('Association des tests'),
        },
        {
          id: employeuseExistanteId,
          denominationAntenne: DenominationEmployeuse('Association des tests'),
          denominationSirene: null,
        },
      ],
    },
  ])('$cas', async ({ employeuses }) => {
    expect(
      await rattacherAUneEmployeuse(homonymes(employeuses))({
        userId,
        source: { _tag: 'Saisie', identite: identiteSaisie },
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
            denominationAntenne: DenominationEmployeuse('Antenne de Rennes'),
            denominationSirene: DenominationEmployeuse('Fédération des tests'),
          },
        ]),
      )({ userId, source: { _tag: 'Saisie', identite: identiteSaisie } }),
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
    const sansDenomination = IdentiteEmployeuse({
      siret: '93429789600011',
      denomination: null,
      adresse: {
        voie: '10 rue de la Bascule',
        commune: 'Nantes',
        codePostal: '44000',
        codeInsee: '44109',
      },
    })

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
        source: { _tag: 'Saisie', identite: sansDenomination },
      }),
    ).toEqual(
      success({
        _tag: 'Rattachee',
        userId,
        employeuseId: employeuseCreeeId,
        employeuseCreee: sansDenomination,
      }),
    )
  })

  it('refuse une saisie dont l’identité est inexploitable', async () => {
    expect(
      await rattacherAUneEmployeuse(ports)({
        userId,
        source: { _tag: 'Saisie', identite: null },
      }),
    ).toEqual(failure({ _tag: 'IdentiteInexploitable' }))
  })
})

describe('rattacher à l’employeuse d’un SIRET', () => {
  it('rattache à l’identité que SIRENE décrit', async () => {
    expect(
      await rattacherAUneEmployeuse(ports)({
        userId,
        source: { _tag: 'Siret', siret },
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
        lireLEtablissement: async () => failure(SireneIndisponible()),
      })({ userId, source: { _tag: 'Siret', siret } }),
    ).toEqual(failure({ _tag: 'SireneIndisponible' }))
  })

  it('refuse un établissement fermé', async () => {
    expect(
      await rattacherAUneEmployeuse({
        ...ports,
        lireLEtablissement: async () => success({ _tag: 'Ferme' }),
      })({ userId, source: { _tag: 'Siret', siret } }),
    ).toEqual(failure({ _tag: 'IdentiteInexploitable' }))
  })

  it('refuse un établissement ouvert dont SIRENE ne tire aucune identité', async () => {
    expect(
      await rattacherAUneEmployeuse({
        ...ports,
        lireLEtablissement: async () =>
          success({ _tag: 'Ouvert', identite: null }),
      })({ userId, source: { _tag: 'Siret', siret } }),
    ).toEqual(failure({ _tag: 'IdentiteInexploitable' }))
  })
})

describe('rattacher à l’employeuse déclarée par ProConnect', () => {
  it('rattache un médiateur à l’employeuse de son SIRET', async () => {
    expect(
      await rattacherAUneEmployeuse(ports)({
        userId,
        source: { _tag: 'ProConnect', siret },
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
    ).toEqual(
      success({
        _tag: 'SansRattachement',
        motif: MotifSansRattachement('SiretAbsent'),
      }),
    )
  })

  it('ne rattache pas un conseiller numérique en poste, dont le dispositif fixe l’employeuse', async () => {
    expect(
      await rattacherAUneEmployeuse({
        ...ports,
        lireLeStatutDeConseillerNumerique: async () => ({ _tag: 'EnPoste' }),
      })({ userId, source: { _tag: 'ProConnect', siret } }),
    ).toEqual(
      success({
        _tag: 'SansRattachement',
        motif: MotifSansRattachement('ConseillerNumeriqueEnPoste'),
      }),
    )
  })

  it('échoue pour un utilisateur inconnu', async () => {
    expect(
      await rattacherAUneEmployeuse({
        ...ports,
        lireLeStatutDeConseillerNumerique: async () => ({
          _tag: 'CompteInconnu',
        }),
      })({ userId, source: { _tag: 'ProConnect', siret } }),
    ).toEqual(failure({ _tag: 'UtilisateurIntrouvable' }))
  })
})
