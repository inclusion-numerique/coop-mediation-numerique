# Fonctionnalité: Trancher les différences entre la fiche de la coop et le registre

Une autre source peut réécrire au registre de l'Entrepôt ce que la coop sait
d'un lieu. La fiche signale alors chaque champ où les deux disent autre chose,
et le médiateur choisit, champ par champ, la valeur à garder.

## Règle: Chaque champ tranché prend la valeur choisie

### Scénario: Reprendre le nom saisi dans la coop

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Et une autre source a renommé ce lieu au registre
* Quand le médiateur rattaché reprend le nom saisi dans la coop
* Alors le registre porte le nom saisi dans la coop

### Scénario: Garder le nom proposé par le registre

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Et une autre source a renommé ce lieu au registre
* Quand le médiateur rattaché garde le nom proposé par le registre
* Alors la coop porte le nom proposé par le registre

## Règle: Un champ que personne ne tranche garde la valeur du registre

> La fenêtre propose d'abord la valeur du registre : c'est elle que le médiateur
> laisse en place quand il ne touche à rien.

### Scénario: Valider sans rien choisir

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Et une autre source a renommé ce lieu au registre
* Quand le médiateur rattaché valide les différences sans rien choisir
* Alors la coop porte le nom proposé par le registre

## Règle: Une fiche qui dit la même chose que le registre n'est pas réécrite

### Scénario: Aucune différence à trancher

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Et cette fiche est inscrite telle quelle au registre
* Quand le médiateur rattaché valide les différences sans rien choisir
* Alors rien n'est réécrit

## Règle: Une fiche supprimée ne se tranche plus

### Scénario: Le lieu supprimé est introuvable

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Et ce lieu est supprimé
* Quand le médiateur rattaché valide les différences sans rien choisir
* Alors les différences ne s'appliquent pas, faute de fiche
