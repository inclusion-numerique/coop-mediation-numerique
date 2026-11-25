# Fonctionnalité: Enregistrer une activité de coordination

## Règle: Le coordinateur enregistre et modifie ses activités

> Une animation, un évènement ou un partenariat est créé puis modifié par le
> coordinateur qui l'a saisi. Les tags choisis doivent lui être accessibles.

### Scénario: Le coordinateur enregistre une animation taguée

* Étant donné un coordinateur disposant du tag "Réseau"
* Quand le coordinateur enregistre une animation de 90 minutes taguée "Réseau"
* Alors l'enregistrement de l'activité de coordination réussit
* Et l'activité de coordination enregistrée est une animation de 90 minutes taguée "Réseau"

### Scénario: Le coordinateur modifie son évènement

* Étant donné un coordinateur ayant enregistré un évènement de 40 participants
* Quand le coordinateur modifie cet évènement pour 55 participants
* Alors l'enregistrement de l'activité de coordination réussit
* Et l'évènement compte 55 participants

## Règle: Seul le coordinateur auteur modifie son activité, sans en changer le type

### Scénario: Un autre coordinateur tente de modifier l'évènement

* Étant donné un coordinateur ayant enregistré un évènement de 40 participants
* Quand un autre coordinateur modifie cet évènement pour 55 participants
* Alors l'enregistrement de l'activité de coordination échoue avec "ActiviteIntrouvable"
* Et l'évènement compte 40 participants

### Scénario: Un évènement ne devient pas une animation

* Étant donné un coordinateur ayant enregistré un évènement de 40 participants
* Quand le coordinateur enregistre cet évènement comme une animation
* Alors l'enregistrement de l'activité de coordination échoue avec "TypeDActiviteIncompatible"

### Scénario: Sans profil de coordinateur, rien n'est enregistré

* Étant donné un coordinateur disposant du tag "Réseau"
* Quand une personne sans profil de coordinateur enregistre une animation
* Alors l'enregistrement de l'activité de coordination échoue avec "ActionNonAutorisee"

## Règle: La saisie respecte les tags accessibles et la date

### Scénario: Un tag inaccessible est refusé

* Étant donné un coordinateur disposant du tag "Réseau"
* Quand le coordinateur enregistre une animation taguée avec un tag qui ne lui est pas accessible
* Alors l'enregistrement de l'activité de coordination échoue avec "TagInutilisable"

### Scénario: Une date au-delà de deux ans est refusée

* Étant donné un coordinateur disposant du tag "Réseau"
* Quand le coordinateur enregistre une animation datée du 1er janvier 2525
* Alors l'enregistrement de l'activité de coordination échoue avec "DateTropLointaine"
