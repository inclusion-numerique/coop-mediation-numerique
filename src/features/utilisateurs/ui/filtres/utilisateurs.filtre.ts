import {
  CoordinateurId,
  Dispositif,
  EmployeuseIdDuFiltre,
  EtendueDesRattachements,
  FiltreStatut,
  type FiltresUtilisateurs,
  filtresStatut,
  LieuActiviteIdDuFiltre,
  RoleFiltre,
  statutDuFiltre,
} from '@/features/utilisateurs/domain'
import {
  composerLEtat,
  filtreDeChoix,
  filtreDeChoixUnique,
  filtreDeRecherche,
  rechercheLibre,
} from '@/libraries/etat-d-url'
import { CodeDepartement, CodeInsee } from '@/libraries/insee'
import { libelleDuStatut } from '../presenters/statut-compte.presenter'

export const filtreDesRoles = filtreDeChoix({
  titre: 'Rôles',
  cle: 'roles',
  choix: {
    mediateur: 'Médiateur',
    coordinateur: 'Coordinateur',
    administrateur: 'Administrateur',
  },
})

const libelleDuFiltre = (filtre: (typeof filtresStatut)[number]): string =>
  libelleDuStatut(statutDuFiltre(filtre))

export const filtreDuStatut = filtreDeChoixUnique({
  titre: 'Statut',
  cle: 'statut',
  choix: {
    inscription0: libelleDuFiltre('inscription0'),
    inscription7: libelleDuFiltre('inscription7'),
    inscription30: libelleDuFiltre('inscription30'),
    inscription60: libelleDuFiltre('inscription60'),
    inscription90: libelleDuFiltre('inscription90'),
    nouveau0: libelleDuFiltre('nouveau0'),
    nouveau7: libelleDuFiltre('nouveau7'),
    nouveau30: libelleDuFiltre('nouveau30'),
    nouveau60: libelleDuFiltre('nouveau60'),
    nouveau90: libelleDuFiltre('nouveau90'),
    actif: libelleDuFiltre('actif'),
    inactif30: libelleDuFiltre('inactif30'),
    inactif90: libelleDuFiltre('inactif90'),
    inactif180: libelleDuFiltre('inactif180'),
    deleted: libelleDuFiltre('deleted'),
  },
})

export const filtreDuDispositif = filtreDeChoixUnique({
  titre: 'Dispositif',
  cle: 'conseiller_numerique',
  choix: {
    ConseillerNumerique: 'Conseiller numérique',
    HorsDispositif: 'Hors dispositif',
  },
  dansLURL: { ConseillerNumerique: '1', HorsDispositif: '0' },
})

export const filtreDesAnciensRattachements = filtreDeChoixUnique({
  titre: 'Rattachements',
  cle: 'historique',
  choix: { ActuelsEtAnciens: 'Avec les anciens rattachements' },
  dansLURL: { ActuelsEtAnciens: '1' },
})

export const filtreDesEmployeuses = filtreDeRecherche({
  titre: 'Employeuses',
  prefixe: 'Employeuse : ',
  cle: 'employeuses',
  schema: EmployeuseIdDuFiltre.schema,
})

export const filtreDesCoordinateurs = filtreDeRecherche({
  titre: 'Coordinateurs',
  prefixe: 'Coordinateur : ',
  cle: 'coordinateurs',
  schema: CoordinateurId.schema,
})

export const filtreDesLieux = filtreDeRecherche({
  titre: 'Lieux d’activité',
  prefixe: 'Lieu d’activité : ',
  cle: 'lieux',
  schema: LieuActiviteIdDuFiltre.schema,
})

export const filtreDesCommunes = filtreDeRecherche({
  titre: 'Communes',
  prefixe: 'Commune : ',
  cle: 'communes',
  schema: CodeInsee.schema,
})

export const filtreDesDepartements = filtreDeRecherche({
  titre: 'Départements',
  prefixe: 'Département : ',
  cle: 'departements',
  schema: CodeDepartement.schema,
})

export const filtresDesUtilisateurs = composerLEtat(
  rechercheLibre,
  filtreDesRoles,
  filtreDuDispositif,
  filtreDuStatut,
  filtreDesEmployeuses,
  filtreDesCoordinateurs,
  filtreDesLieux,
  filtreDesCommunes,
  filtreDesDepartements,
  filtreDesAnciensRattachements,
)

export type ValeursDesUtilisateurs = ReturnType<
  typeof filtresDesUtilisateurs.charger
>

export const filtresUtilisateursDesFiltres = (
  valeurs: ValeursDesUtilisateurs,
): FiltresUtilisateurs => ({
  roles: valeurs.roles.map((role) => RoleFiltre(role)),
  statut: valeurs.statut === null ? null : FiltreStatut(valeurs.statut),
  dispositif:
    valeurs.conseiller_numerique === null
      ? null
      : Dispositif(valeurs.conseiller_numerique),
  employeuses: valeurs.employeuses,
  coordinateurs: valeurs.coordinateurs,
  rattachements: EtendueDesRattachements(
    valeurs.historique === null ? 'Actuels' : valeurs.historique,
  ),
  lieux: valeurs.lieux,
  communes: valeurs.communes,
  departements: valeurs.departements,
})
