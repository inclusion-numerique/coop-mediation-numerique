import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { ApiIndisponible } from '../../../domain/errors'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import { StatutPresence } from '../../../domain/rdv/statut-presence'
import { marquerLeRendezVousHonore } from './marquer-le-rendez-vous-honore'
import type { MettreAJourStatutRdv } from './mettre-a-jour-statut-rdv'

const utilisateurId = UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c')

const marquer = (mettreAJour: MettreAJourStatutRdv) =>
  marquerLeRendezVousHonore({ mettreAJour, signaler: () => undefined })(
    utilisateurId,
  )(77)

describe('marquerLeRendezVousHonore', () => {
  it.each<{ cas: string; mettreAJour: MettreAJourStatutRdv }>([
    {
      cas: 'aboutit quand le rendez-vous est marqué honoré',
      mettreAJour: async () =>
        success({
          statutPresence: StatutPresence('seen'),
          compteRenduRegle: true,
        }),
    },
    {
      cas: 'n’échoue pas quand RDV Service Public refuse la mise à jour',
      mettreAJour: async () =>
        failure(ApiIndisponible(503, 'service indisponible')),
    },
    {
      cas: 'n’échoue pas quand la mise à jour lève',
      mettreAJour: () => Promise.reject(new Error('connexion perdue')),
    },
  ])('$cas', async ({ mettreAJour }) => {
    await expect(marquer(mettreAJour)).resolves.toBeUndefined()
  })
})
