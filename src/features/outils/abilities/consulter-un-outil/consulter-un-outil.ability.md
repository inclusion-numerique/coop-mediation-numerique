# Feature: Consulter un outil

> Chaque outil présenté dans « Mes outils » a sa fiche, adressée par un slug
> dans l'URL.

## Rule: Seuls les outils présentés ont une fiche

### Scenario: Un outil présenté a sa fiche

* When on demande la fiche de l'outil "aidants-connect"
* Then la fiche existe

### Scenario: Un slug inconnu n'a pas de fiche

* When on demande la fiche de l'outil "outil-inconnu"
* Then la fiche n'existe pas
