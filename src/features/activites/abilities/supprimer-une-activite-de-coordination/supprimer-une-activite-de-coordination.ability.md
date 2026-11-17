# Feature: Supprimer une activité de coordination

## Rule: Le coordinateur supprime ses propres activités

> La suppression est douce : l'activité quitte l'historique mais reste en
> base, détachée de ses tags.

### Scenario: Le coordinateur supprime son activité

* Given une activité de coordination taguée, enregistrée par un coordinateur
* When le coordinateur supprime cette activité
* Then la suppression de l'activité réussit
* And l'activité est marquée supprimée
* And l'activité n'a plus de tag

## Rule: Personne d'autre ne supprime l'activité d'un coordinateur

### Scenario: Un autre coordinateur tente la suppression

* Given une activité de coordination taguée, enregistrée par un coordinateur
* When un autre coordinateur supprime cette activité
* Then la suppression de l'activité échoue avec "ActionNonAutorisee"
* And l'activité n'est pas marquée supprimée

### Scenario: Une activité déjà supprimée est introuvable

* Given une activité de coordination taguée, enregistrée par un coordinateur
* When le coordinateur supprime cette activité
* And le coordinateur supprime cette activité
* Then la suppression de l'activité échoue avec "ActiviteIntrouvable"
