# Fonctionnalité: Lister ses activités de coordination

## Règle: Le coordinateur ne voit que ses activités vivantes, de la plus récente à la plus ancienne

### Scénario: Les activités supprimées et celles d'un autre coordinateur sont écartées

* Étant donné des activités de coordination enregistrées
* Quand je liste mes activités de coordination
* Alors 3 activités de coordination sont listées
* Et les types listés sont "Partenariat, Evenement, Animation"

## Règle: Les critères de recherche se cumulent

### Scénario: Filtrer par type

* Étant donné des activités de coordination enregistrées
* Quand je liste mes activités de coordination de type "Animation,Evenement"
* Alors les types listés sont "Evenement, Animation"

### Scénario: Filtrer par tag

* Étant donné des activités de coordination enregistrées
* Quand je liste mes activités de coordination taguées « Élus »
* Alors les types listés sont "Partenariat"

### Scénario: Filtrer par période

* Étant donné des activités de coordination enregistrées
* Quand je liste mes activités de coordination du "2026-05-01" au "2026-06-01"
* Alors les types listés sont "Evenement"

## Règle: La liste se pagine

### Scénario: Deuxième page de dix lignes

* Étant donné des activités de coordination enregistrées
* Et 9 animations de coordination de plus, en janvier 2026
* Quand je liste la page 2 de mes activités de coordination, 10 par page
* Alors 12 activités de coordination sont comptées sur 2 pages
* Et les types listés sont "Animation, Animation"

## Règle: Les filtres proposent les tags utilisés et la période couverte

### Scénario: Options de filtre

* Étant donné des activités de coordination enregistrées
* Quand je consulte les options de filtre de mes activités de coordination
* Alors 2 tags sont proposés
* Et la période couverte va du "2026-02-10" au "2026-06-30"
