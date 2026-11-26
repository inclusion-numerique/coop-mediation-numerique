import { describe, expect, it } from 'vitest'
import {
  AccesRefuse,
  AgentSupprime,
  ApiIndisponible,
  CompteNonLie,
  type EchecDeSynchronisation,
  ErreurTechnique,
  JetonRevoque,
  messageDeLEchec,
  ReponseInattendue,
} from './errors'

describe('message d’un échec de synchronisation', () => {
  it.each<{ cas: string; echec: EchecDeSynchronisation; message: string }>([
    {
      cas: 'nomme le chemin refusé',
      echec: AccesRefuse('/rdvs', null),
      message: 'AccesRefuse : /rdvs',
    },
    {
      cas: 'nomme le chemin d’un agent supprimé',
      echec: AgentSupprime('/agents/me'),
      message: 'AgentSupprime : /agents/me',
    },
    {
      cas: 'donne le statut d’une API indisponible',
      echec: ApiIndisponible(503, 'maintenance'),
      message: 'ApiIndisponible : 503 maintenance',
    },
    {
      cas: 'situe une réponse inattendue',
      echec: ReponseInattendue('/rdvs', 'champ manquant'),
      message: 'ReponseInattendue : /rdvs champ manquant',
    },
    {
      cas: 'se contente du motif quand il n’y a rien à préciser',
      echec: JetonRevoque(null),
      message: 'JetonRevoque',
    },
    {
      cas: 'se contente du motif d’un compte non lié',
      echec: CompteNonLie(null),
      message: 'CompteNonLie',
    },
    {
      cas: 'reprend le message d’une erreur technique',
      echec: ErreurTechnique(new Error('connexion perdue')),
      message: 'connexion perdue',
    },
    {
      cas: 'reprend telle quelle une erreur technique qui n’est pas une Error',
      echec: ErreurTechnique('délai dépassé'),
      message: 'délai dépassé',
    },
  ])('$cas', ({ echec, message }) => {
    expect(messageDeLEchec(echec)).toBe(message)
  })
})
