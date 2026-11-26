import { describe, expect, it } from 'vitest'
import { NomAffiche, UtilisateurId } from '@/features/utilisateurs/domain'
import type { SessionCourante } from './session-courante'
import { terminerLUsurpation } from './terminer-l-usurpation'

const administrateur = UtilisateurId('1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f')

const nom = NomAffiche('Alice Admin')

const terminerAvec = (session: SessionCourante | null) =>
  terminerLUsurpation({
    lireLaSession: async () => session,
    rendreLaSession: async () => nom,
  })('jeton')

describe('terminer une usurpation', () => {
  it('rend la session à l’administrateur usurpateur', async () => {
    expect(
      await terminerAvec({
        jeton: 'jeton',
        usurpation: {
          _tag: 'EnCours',
          usurpateurId: administrateur,
          usurpateurEstAdministrateur: true,
        },
      }),
    ).toEqual({ success: true, data: { nom } })
  })

  it.each<{ cas: string; session: SessionCourante | null; erreur: string }>([
    {
      cas: 'refuse sans session',
      session: null,
      erreur: 'AucuneUsurpationEnCours',
    },
    {
      cas: 'refuse sans usurpation en cours',
      session: { jeton: 'jeton', usurpation: { _tag: 'Aucune' } },
      erreur: 'AucuneUsurpationEnCours',
    },
    {
      cas: 'refuse si l’usurpateur n’est plus administrateur',
      session: {
        jeton: 'jeton',
        usurpation: {
          _tag: 'EnCours',
          usurpateurId: administrateur,
          usurpateurEstAdministrateur: false,
        },
      },
      erreur: 'UsurpateurNonAdministrateur',
    },
  ])('$cas', async ({ session, erreur }) => {
    expect(await terminerAvec(session)).toEqual({
      success: false,
      error: { _tag: erreur },
    })
  })
})
