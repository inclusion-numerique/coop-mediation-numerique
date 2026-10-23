import { CodeDepartement } from '@app/web/libraries/departement'
import { NomAffiche } from '@app/web/libraries/nom-affiche'
import type { Acteur, Mediation } from './acteur'
import { ActeurId } from './acteur-id'
import { CoordinateurId } from './coordinateur-id'
import { Courriel } from './courriel'
import { Dispositif } from './dispositif'
import { Effectif } from './effectif'
import { MediateurId } from './mediateur-id'

export const mediation: Mediation = {
  mediateurId: MediateurId('a1b2c3d4-0000-4000-8000-000000000001'),
  nombreDeLieux: Effectif(2),
  coordinateurs: [
    {
      acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000002'),
      nomAffiche: NomAffiche('Alex Durand'),
      departement: CodeDepartement('15'),
    },
  ],
}

export const mediateurHorsDispositif: Acteur = {
  acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000003'),
  nomAffiche: NomAffiche('Camille Martin'),
  courriel: Courriel('camille.martin@example.org'),
  profil: {
    _tag: 'Mediateur',
    dispositif: Dispositif('HorsDispositif'),
    mediation,
  },
}

export const coordinateurConseillerNumerique: Acteur = {
  acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000004'),
  nomAffiche: NomAffiche('Sacha Bernard'),
  courriel: Courriel('sacha.bernard@example.org'),
  profil: {
    _tag: 'Coordinateur',
    dispositif: Dispositif('ConseillerNumerique'),
    coordinateurId: CoordinateurId('a1b2c3d4-0000-4000-8000-000000000005'),
    mediation: null,
  },
}
