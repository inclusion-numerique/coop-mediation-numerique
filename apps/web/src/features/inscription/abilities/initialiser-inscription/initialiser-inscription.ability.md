# Feature: Initialiser l’inscription

## Rule: L’étape suivante est dérivée des données Dataspace et de l’état de l’utilisateur

### Scenario: Utilisateur inconnu du Dataspace

* Given le Dataspace ne connaît pas l’utilisateur
* And l’utilisateur n’a ni profil ni lieu d’activité
* When j’initialise l’inscription
* Then l’étape suivante de l’initialisation est "choisir-role"

### Scenario: Conseiller numérique sans lieu d’activité

* Given le Dataspace renvoie un conseiller numérique
* And l’utilisateur a le profil "ConseillerNumerique" sans lieu d’activité
* When j’initialise l’inscription
* Then l’étape suivante de l’initialisation est "verifier-informations"

### Scenario: Conseiller numérique avec lieu d’activité

* Given le Dataspace renvoie un conseiller numérique
* And l’utilisateur a le profil "ConseillerNumerique" avec des lieux d’activité
* When j’initialise l’inscription
* Then l’étape suivante de l’initialisation est "recapitulatif"
