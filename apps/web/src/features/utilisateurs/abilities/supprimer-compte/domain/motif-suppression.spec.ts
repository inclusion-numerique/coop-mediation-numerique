import { AuteurId } from '@app/web/features/utilisateurs/domain'
import type { AuteurSuppression } from './auteur-suppression'
import { motifDe } from './motif-suppression'
import { RetentionPolicy } from './retention-policy'

const ADMINISTRATEUR = AuteurId('6f1c9d2b-4e35-4a07-8b63-9b634e588a07')

describe('motif de suppression', () => {
  it('attribue au titulaire ce qu’il a demandé lui-même', () => {
    expect(motifDe({ _tag: 'titulaire' })).toBe('DemandeDuTitulaire')
  })

  it('attribue à l’administrateur sa décision, et non une demande', () => {
    expect(
      motifDe({ _tag: 'administrateur', administrateurId: ADMINISTRATEUR }),
    ).toBe('DecisionAdministrateur')
  })

  // Le motif d'un effacement automatique vient de la POLITIQUE, pas du fait
  // qu'il soit automatique : c'est ce qui empêchera la prochaine politique de
  // se journaliser sous celle-ci.
  it('attribue au système le motif de la politique qui l’a déclenché', () => {
    expect(
      motifDe({
        _tag: 'systeme',
        policy: RetentionPolicy('InscritJamaisActif'),
      }),
    ).toBe('InactiviteApresInscription')
  })

  it('donne des motifs distincts à trois auteurs distincts', () => {
    const auteurs: readonly AuteurSuppression[] = [
      { _tag: 'titulaire' },
      { _tag: 'administrateur', administrateurId: ADMINISTRATEUR },
      { _tag: 'systeme', policy: RetentionPolicy('InscritJamaisActif') },
    ]

    expect(new Set(auteurs.map(motifDe)).size).toBe(auteurs.length)
  })
})
