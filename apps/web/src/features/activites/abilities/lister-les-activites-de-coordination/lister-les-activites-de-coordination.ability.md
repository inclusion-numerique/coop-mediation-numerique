# Feature: Lister ses activités de coordination

## Rule: Le coordinateur ne voit que ses activités vivantes, de la plus récente à la plus ancienne

### Scenario: Les activités supprimées et celles d'un autre coordinateur sont écartées

* Given des activités de coordination enregistrées
* When je liste mes activités de coordination
* Then 3 activités de coordination sont listées
* And les types listés sont "Partenariat, Evenement, Animation"

## Rule: Les critères de recherche se cumulent

### Scenario: Filtrer par type

* Given des activités de coordination enregistrées
* When je liste mes activités de coordination de type "Animation,Evenement"
* Then les types listés sont "Evenement, Animation"

### Scenario: Filtrer par tag

* Given des activités de coordination enregistrées
* When je liste mes activités de coordination taguées « Élus »
* Then les types listés sont "Partenariat"

### Scenario: Filtrer par période

* Given des activités de coordination enregistrées
* When je liste mes activités de coordination du "2026-05-01" au "2026-06-01"
* Then les types listés sont "Evenement"

## Rule: La liste se pagine

### Scenario: Deuxième page de deux lignes

* Given des activités de coordination enregistrées
* When je liste la page 2 de mes activités de coordination, 2 par page
* Then 3 activités de coordination sont comptées sur 2 pages
* And les types listés sont "Animation"

## Rule: Les filtres proposent les tags utilisés et la période couverte

### Scenario: Options de filtre

* Given des activités de coordination enregistrées
* When je consulte les options de filtre de mes activités de coordination
* Then 2 tags sont proposés
* And la période couverte va du "2026-02-10" au "2026-06-30"
