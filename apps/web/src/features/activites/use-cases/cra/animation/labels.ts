import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { EcosystemIcon } from '@app/web/features/pictograms/digital/EcosystemIcon'
import { InnovationIcon } from '@app/web/features/pictograms/digital/InnovationIcon'
import { DocumentSignature } from '@app/web/features/pictograms/document/DocumentSignature'
import { CommunityIcon } from '@app/web/features/pictograms/leisure/CommunityIcon'
import { Compass } from '@app/web/features/pictograms/map/Compass'
import {
  InitiativeValue,
  ThematiqueAnimationValue,
  TypeAnimationValue,
} from './validation/CraAnimationValidation'

export const INITIATIVE_OPTIONS: SelectOption<InitiativeValue>[] = [
  { label: 'Intervention à mon initiative', value: 'Initiative' },
  { label: 'Réponse à un besoin/une problématique', value: 'Demande' },
]

export const TYPE_ANIMATION_OPTIONS: SelectOption<TypeAnimationValue>[] = [
  {
    label:
      'Assemblée / présentation officielle (Ex : conseil municipal, conseil communautaire, conseil départemental, CA d’association)',
    value: 'Assemblee',
  },
  { label: 'Comité technique / de pilotage', value: 'Comite' },
  { label: 'Groupe de travail', value: 'GroupeDeTravail' },
  { label: 'Moment d’échange / aide / soutien', value: 'Echange' },
  {
    label:
      'Réunion de coordination (coordinateurs, médiateurs et conseillers numériques, préfectures, Hubs...)',
    value: 'ReunionCoordination',
  },
  { label: 'Webinaire', value: 'Webinaire' },
  { label: 'Autre', value: 'Autre' },
]

export const THEMATIQUE_ANIMATION_OPTIONS: SelectOption<ThematiqueAnimationValue>[] =
  [
    {
      label: 'Échanges de bonnes pratiques / partage d’informations',
      value: 'Partage',
      hint: 'Accompagner les médiateurs dans leur pratique quotidienne de la médiation numérique (Bonnes pratiques, comment améliorer/faire évoluer ses accompagnements...)',
      extra: {
        illustration: CommunityIcon,
        tooltips: [
          'Information sur le dispositif Conseiller numérique',
          'Échange sur la posture professionnelle',
          'Organisation d’atelier',
          'Prodiguer une recommandation',
          'Problématique psychosociale d’un usager',
          'Rencontre avec un(e) médiateur/trice',
        ],
      },
    },
    {
      label: 'Maillage territorial - faire réseau / créer du lien',
      value: 'Reseau',
      hint: 'Accompagnement à la mise en place de partenariats, mise en relation intra services, positionnement territorial...',
      extra: {
        illustration: EcosystemIcon,
        tooltips: [
          'Accompagnement à la mise en place de partenariats',
          'Information sur actions et partenariats locaux',
          'Mise en relation intra services',
          'Positionnement territorial',
        ],
      },
    },
    {
      label: 'Soutien technique et/ou organisationnel',
      value: 'Soutien',
      hint: 'Accompagner un médiateur et/ou une structure sur des besoins logistiques, financiers, d’organisation du temps du travail...',
      extra: {
        illustration: InnovationIcon,
        tooltips: [
          'Accompagnement à la recherche de financements',
          'Accompagnement à l’organisation d’évènements',
          'Demande d’intervention technique / Dépannage',
          'Périmètre d’action conseiller numérique',
          'Planning',
          'Recherche de local',
          'Réorganisation du temps de travail',
        ],
      },
    },
    {
      label: 'Projet / Parcours professionnel',
      value: 'Professionnel',
      hint: "Proposition de formation, posture professionnelle, embarquement d'un nouveau médiateur numérique, bilan d'activité...",
      extra: {
        illustration: Compass,
        tooltips: [
          'Formation interne',
          'Identification/proposition de formation',
          'Onboarding d’un(e) médiateur/trice',
          'Report hiérarchique',
          'Point sur l’activité / Bilan d’activité',
        ],
      },
    },
    {
      label: 'Soutien RH auprès des structures',
      value: 'RH',
      hint: 'Aide au recrutement, convention, fin de contrat...',
      extra: {
        illustration: DocumentSignature,
        tooltips: [
          'Remplacement / renfort',
          'RH (recrutement, fin de contrat)',
        ],
      },
    },
    {
      label: 'Autre thématique',
      value: 'Autre',
      hint: 'Sélectionnez “autre thématique” si votre intervention ne correspond pas aux thématiques proposées.',
    },
  ]
