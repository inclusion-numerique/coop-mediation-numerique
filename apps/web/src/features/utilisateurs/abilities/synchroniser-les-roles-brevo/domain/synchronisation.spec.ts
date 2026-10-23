import {
  AdresseCourriel,
  CoordinateurId,
  Dispositif,
  type InscritDeLaListe,
  MediateurId,
  type RattachementsDuCompte,
  rattachements,
  situationDansLeDispositif,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { contactsASynchroniser } from './synchronisation'

const rattachementsDuMediateur = (
  mediateur: MediateurId | null,
): RattachementsDuCompte =>
  rattachements<MediateurId, CoordinateurId>(mediateur, null)

const hors = situationDansLeDispositif(Dispositif('HorsDispositif'), false)

const inscrit = (
  courriel: string,
  mediateur: MediateurId | null,
): InscritDeLaListe => ({
  id: UtilisateurId('3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f'),
  courriel: AdresseCourriel(courriel),
  prenom: null,
  nom: null,
  telephone: null,
  rattachements: rattachementsDuMediateur(mediateur),
  dispositif: hors,
})

describe('contacts à synchroniser', () => {
  it('sépare les inscrits à importer de ceux à retirer', () => {
    const { aImporter, aRetirer } = contactsASynchroniser([
      inscrit(
        'avec@example.com',
        MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8'),
      ),
      inscrit('sans@example.com', null),
    ])

    expect(aImporter.map(({ courriel }) => courriel)).toEqual([
      'avec@example.com',
    ])
    expect(aRetirer).toEqual(['sans@example.com'])
  })
})
