import {
  AdresseCourriel,
  jalon,
  Prenom,
  rattachements,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'
import { addDays, subYears } from 'date-fns'
import {
  ANNEES_AVANT_SUPPRESSION,
  type CompteAExaminer,
  JOURS_DE_PREAVIS,
} from '../../domain'

export const lireLesComptesAExaminer = async (
  maintenant: Date,
): Promise<readonly CompteAExaminer[]> => {
  const comptes = await prismaClient.user.findMany({
    where: {
      deleted: null,
      role: 'User',
      inscriptionValidee: {
        lt: addDays(
          subYears(maintenant, ANNEES_AVANT_SUPPRESSION),
          JOURS_DE_PREAVIS,
        ),
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      inscriptionValidee: true,
      lastLogin: true,
      lastSeen: true,
      avertissementInactiviteLe: true,
      mediateur: { select: { derniereCreationActivite: true } },
      coordinateur: { select: { id: true } },
    },
  })

  return comptes.flatMap((compte) =>
    compte.inscriptionValidee == null
      ? []
      : [
          {
            id: UtilisateurId(compte.id),
            courriel: AdresseCourriel(compte.email),
            prenom: Prenom.safe(compte.firstName ?? ''),
            inscritLe: compte.inscriptionValidee,
            presence: rattachements(
              compte.mediateur === null
                ? null
                : {
                    dernierCompteRendu: jalon(
                      compte.mediateur.derniereCreationActivite,
                    ),
                    derniereConnexion: jalon(compte.lastLogin),
                  },
              compte.coordinateur === null
                ? null
                : { derniereVisite: jalon(compte.lastSeen) },
            ),
            avertiLe: jalon(compte.avertissementInactiviteLe),
          },
        ],
  )
}
