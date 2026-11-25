# Fonctionnalité: Lister les options de filtre des activités

> La barre de filtres de « Mes activités » propose la période couverte, les
> employeuses, les tags et le filtre de source à partir des seules activités
> vivantes du médiateur.

## Règle: Seules les activités vivantes du médiateur alimentent les options

### Scénario: Une activité supprimée et celle d'un autre médiateur n'élargissent rien

* Étant donné le médiateur a une activité le "2026-02-10" pour l'employeuse "Mairie de Lyon" taguée "Numérique"
* Et le médiateur a une activité le "2026-03-20" pour l'employeuse "Association Numérique" taguée "Parentalité"
* Et une activité supprimée du médiateur le "2025-01-05" pour l'employeuse "Centre Social" taguée "Santé"
* Et un autre médiateur a une activité le "2024-06-01" pour l'employeuse "Conseil départemental" taguée "Emploi"
* Quand je liste les options de filtre de mes activités
* Alors la période proposée va du "2026-02-10" au "2026-03-20"
* Et les employeuses proposées sont "Association Numérique, Mairie de Lyon"
* Et les tags proposés sont "Numérique, Parentalité"
* Et le filtre de source n'est pas proposé

### Scénario: Un tag supprimé n'est plus proposé

* Étant donné le médiateur a une activité le "2026-02-10" pour l'employeuse "Mairie de Lyon" taguée "Numérique"
* Et le tag "Numérique" a été supprimé
* Quand je liste les options de filtre de mes activités
* Alors aucun tag n'est proposé

## Règle: Le filtre de source n'apparaît qu'avec un import v1 vivant

### Scénario: Une activité importée de la v1 propose le filtre de source

* Étant donné le médiateur a une activité importée de la v1 le "2026-01-15"
* Quand je liste les options de filtre de mes activités
* Alors le filtre de source est proposé

### Scénario: Une activité importée de la v1 puis supprimée ne le propose pas

* Étant donné le médiateur a une activité importée de la v1 le "2026-01-15", supprimée depuis
* Quand je liste les options de filtre de mes activités
* Alors le filtre de source n'est pas proposé

## Règle: Un médiateur sans activité vivante n'a aucune activité à filtrer

### Scénario: Seule une activité supprimée

* Étant donné une activité supprimée du médiateur le "2025-01-05" pour l'employeuse "Centre Social" taguée "Santé"
* Quand je liste les options de filtre de mes activités
* Alors le médiateur n'a aucune activité

## Règle: Les statistiques proposent les tags les plus utilisés du périmètre

### Scénario: Le tag le plus utilisé vient en premier

* Étant donné le médiateur a une activité le "2026-02-10" pour l'employeuse "Mairie de Lyon" taguée "Parentalité"
* Et le médiateur a une activité le "2026-02-11" pour l'employeuse "Mairie de Lyon" taguée "Numérique"
* Et le médiateur a une activité le "2026-02-12" pour l'employeuse "Mairie de Lyon" taguée "Numérique"
* Quand je liste les tags les plus utilisés de mon périmètre
* Alors les tags les plus utilisés sont "Numérique, Parentalité"
