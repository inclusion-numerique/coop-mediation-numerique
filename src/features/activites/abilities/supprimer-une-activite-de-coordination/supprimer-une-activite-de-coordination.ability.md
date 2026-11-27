# Fonctionnalité: Supprimer une activité de coordination

## Règle: Le coordinateur supprime ses propres activités

> La suppression est douce : l'activité quitte l'historique mais reste en
> base, détachée de ses tags.

### Scénario: Le coordinateur supprime son activité

* Étant donné une activité de coordination taguée, enregistrée par un coordinateur
* Quand le coordinateur supprime cette activité
* Alors la suppression de l'activité réussit
* Et l'activité est marquée supprimée
* Et l'activité n'a plus de tag

## Règle: Personne d'autre ne supprime l'activité d'un coordinateur

### Scénario: Un autre coordinateur tente la suppression

* Étant donné une activité de coordination taguée, enregistrée par un coordinateur
* Quand un autre coordinateur supprime cette activité
* Alors la suppression de l'activité échoue avec "ActionNonAutorisee"
* Et l'activité n'est pas marquée supprimée

### Scénario: L'écriture de la suppression ignore l'activité d'un autre coordinateur

* Étant donné une activité de coordination taguée, enregistrée par un coordinateur
* Quand un autre coordinateur écrit la suppression de cette activité
* Alors l'activité n'est pas marquée supprimée
* Et l'activité garde son tag

### Scénario: Une activité déjà supprimée est introuvable

* Étant donné une activité de coordination taguée, enregistrée par un coordinateur
* Quand le coordinateur supprime cette activité
* Et le coordinateur supprime cette activité
* Alors la suppression de l'activité échoue avec "ActiviteIntrouvable"
