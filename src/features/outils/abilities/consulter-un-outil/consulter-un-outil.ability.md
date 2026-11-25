# Fonctionnalité: Consulter un outil

> Chaque outil présenté dans « Mes outils » a sa fiche, adressée par un slug
> dans l'URL.

## Règle: Seuls les outils présentés ont une fiche

### Scénario: Un outil présenté a sa fiche

* Quand on demande la fiche de l'outil "aidants-connect"
* Alors la fiche existe

### Scénario: Un slug inconnu n'a pas de fiche

* Quand on demande la fiche de l'outil "outil-inconnu"
* Alors la fiche n'existe pas
