# Fonctionnalité: Initialiser l’inscription

## Règle: L’étape suivante est dérivée du dispositif et de l’état de l’utilisateur

### Scénario: Utilisateur inconnu du dispositif

* Étant donné le dispositif ne connaît pas l’utilisateur
* Et l’utilisateur n’a ni profil ni lieu d’activité
* Quand j’initialise l’inscription
* Alors l’étape suivante de l’initialisation est "choisir-role"

### Scénario: Conseiller numérique sans lieu d’activité

* Étant donné le dispositif connaît l’utilisateur comme conseiller numérique
* Et l’utilisateur a le profil "ConseillerNumerique" sans lieu d’activité
* Quand j’initialise l’inscription
* Alors l’étape suivante de l’initialisation est "verifier-informations"

### Scénario: Conseiller numérique avec lieu d’activité

* Étant donné le dispositif connaît l’utilisateur comme conseiller numérique
* Et l’utilisateur a le profil "ConseillerNumerique" avec des lieux d’activité
* Quand j’initialise l’inscription
* Alors l’étape suivante de l’initialisation est "recapitulatif"
