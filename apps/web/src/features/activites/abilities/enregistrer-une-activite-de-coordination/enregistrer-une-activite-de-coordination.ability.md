# Feature: Enregistrer une activité de coordination

## Rule: Le coordinateur enregistre et modifie ses activités

> Une animation, un évènement ou un partenariat est créé puis modifié par le
> coordinateur qui l'a saisi. Les tags choisis doivent lui être accessibles.

### Scenario: Le coordinateur enregistre une animation taguée

* Given un coordinateur disposant du tag "Réseau"
* When le coordinateur enregistre une animation de 90 minutes taguée "Réseau"
* Then l'enregistrement de l'activité de coordination réussit
* And l'activité de coordination enregistrée est une animation de 90 minutes taguée "Réseau"

### Scenario: Le coordinateur modifie son évènement

* Given un coordinateur ayant enregistré un évènement de 40 participants
* When le coordinateur modifie cet évènement pour 55 participants
* Then l'enregistrement de l'activité de coordination réussit
* And l'évènement compte 55 participants

## Rule: Seul le coordinateur auteur modifie son activité, sans en changer le type

### Scenario: Un autre coordinateur tente de modifier l'évènement

* Given un coordinateur ayant enregistré un évènement de 40 participants
* When un autre coordinateur modifie cet évènement pour 55 participants
* Then l'enregistrement de l'activité de coordination échoue avec "ActiviteIntrouvable"
* And l'évènement compte 40 participants

### Scenario: Un évènement ne devient pas une animation

* Given un coordinateur ayant enregistré un évènement de 40 participants
* When le coordinateur enregistre cet évènement comme une animation
* Then l'enregistrement de l'activité de coordination échoue avec "TypeDActiviteIncompatible"

### Scenario: Sans profil de coordinateur, rien n'est enregistré

* Given un coordinateur disposant du tag "Réseau"
* When une personne sans profil de coordinateur enregistre une animation
* Then l'enregistrement de l'activité de coordination échoue avec "ActionNonAutorisee"

## Rule: La saisie respecte les tags accessibles et la date

### Scenario: Un tag inaccessible est refusé

* Given un coordinateur disposant du tag "Réseau"
* When le coordinateur enregistre une animation taguée avec un tag qui ne lui est pas accessible
* Then l'enregistrement de l'activité de coordination échoue avec "TagInutilisable"

### Scenario: Une date au-delà de deux ans est refusée

* Given un coordinateur disposant du tag "Réseau"
* When le coordinateur enregistre une animation datée du 1er janvier 2525
* Then l'enregistrement de l'activité de coordination échoue avec "DateTropLointaine"
