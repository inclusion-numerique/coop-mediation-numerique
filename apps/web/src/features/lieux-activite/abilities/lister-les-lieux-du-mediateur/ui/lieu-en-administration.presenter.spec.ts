import { Adresse, Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { LieuId } from '../../../domain/lieu-id'
import { NombreDeMediateurs } from '../../../domain/nombres'
import { RattachementId } from '../../../domain/rattachement-id'
import { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'
import type { LieuDuMediateurEnListe } from '../domain'
import { lieuEnAdministration } from './lieu-en-administration.presenter'

const rattachement = (
  adresse: LieuDuMediateurEnListe['lieuInclusion']['adresse'],
): LieuDuMediateurEnListe => ({
  id: RattachementId('550e8400-e29b-41d4-a716-446655440001'),
  debut: new Date('2026-01-15T10:00:00Z'),
  lieuInclusion: {
    id: LieuId('550e8400-e29b-41d4-a716-446655440000'),
    nom: Nom('Espace numérique'),
    nomUsage: null,
    adresse,
    adresseAPreciser: false,
    derniereModification: { _tag: 'Inconnue', date: new Date() },
    visibilite: VisibiliteCartographie('NonPublie'),
    identifiantCartographie: null,
    mediateurs: NombreDeMediateurs(1),
  },
})

describe('un lieu d’activité vu depuis l’administration', () => {
  it('détaille l’adresse reconnue', () => {
    expect(
      lieuEnAdministration(
        rattachement(
          Adresse({
            voie: '12 rue de la Paix',
            commune: 'Reims',
            code_postal: '51100',
            code_insee: '51454',
          }),
        ),
      ),
    ).toMatchObject({
      adresse: '12 rue de la Paix',
      commune: 'Reims',
      codePostal: '51100',
      codeInsee: '51454',
    })
  })

  it('dit ce qui manque quand l’adresse n’est pas reconnue', () => {
    expect(lieuEnAdministration(rattachement(null))).toMatchObject({
      adresse: 'Non renseignée',
      commune: 'Non renseignée',
      codePostal: 'Non renseigné',
      codeInsee: 'Non renseigné',
    })
  })
})
