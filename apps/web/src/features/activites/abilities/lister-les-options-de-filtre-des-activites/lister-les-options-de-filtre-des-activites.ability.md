# Feature: Lister les options de filtre des activités

> La barre de filtres de « Mes activités » propose la période couverte, les
> employeuses, les tags et le filtre de source à partir des seules activités
> vivantes du médiateur.

## Rule: Seules les activités vivantes du médiateur alimentent les options

### Scenario: Une activité supprimée et celle d'un autre médiateur n'élargissent rien

* Given le médiateur a une activité le "2026-02-10" pour l'employeuse "Mairie de Lyon" taguée "Numérique"
* And le médiateur a une activité le "2026-03-20" pour l'employeuse "Association Numérique" taguée "Parentalité"
* And une activité supprimée du médiateur le "2025-01-05" pour l'employeuse "Centre Social" taguée "Santé"
* And un autre médiateur a une activité le "2024-06-01" pour l'employeuse "Conseil départemental" taguée "Emploi"
* When je liste les options de filtre de mes activités
* Then la période proposée va du "2026-02-10" au "2026-03-20"
* And les employeuses proposées sont "Association Numérique, Mairie de Lyon"
* And les tags proposés sont "Numérique, Parentalité"
* And le filtre de source n'est pas proposé

### Scenario: Un tag supprimé n'est plus proposé

* Given le médiateur a une activité le "2026-02-10" pour l'employeuse "Mairie de Lyon" taguée "Numérique"
* And le tag "Numérique" a été supprimé
* When je liste les options de filtre de mes activités
* Then aucun tag n'est proposé

## Rule: Le filtre de source n'apparaît qu'avec un import v1 vivant

### Scenario: Une activité importée de la v1 propose le filtre de source

* Given le médiateur a une activité importée de la v1 le "2026-01-15"
* When je liste les options de filtre de mes activités
* Then le filtre de source est proposé

### Scenario: Une activité importée de la v1 puis supprimée ne le propose pas

* Given le médiateur a une activité importée de la v1 le "2026-01-15", supprimée depuis
* When je liste les options de filtre de mes activités
* Then le filtre de source n'est pas proposé

## Rule: Un médiateur sans activité vivante n'a aucune activité à filtrer

### Scenario: Seule une activité supprimée

* Given une activité supprimée du médiateur le "2025-01-05" pour l'employeuse "Centre Social" taguée "Santé"
* When je liste les options de filtre de mes activités
* Then le médiateur n'a aucune activité
