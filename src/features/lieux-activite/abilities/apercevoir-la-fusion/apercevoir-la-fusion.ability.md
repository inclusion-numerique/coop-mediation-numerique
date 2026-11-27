# Fonctionnalité: Apercevoir la fusion de deux lieux d'activité

> Avant de fusionner, l'administration voit côte à côte la fiche à absorber et
> celle à conserver, et ce que les deux déclarent déjà en commun. L'aperçu
> n'écrit rien : il prépare la décision.

## Règle: L'aperçu relève ce que les deux fiches déclarent en commun

### Scénario: Un service annoncé par les deux lieux est relevé

* Étant donné deux lieux qui annoncent un même service
* Quand l'administration aperçoit la fusion du premier dans le second
* Alors l'aperçu montre les deux lieux
* Et l'aperçu relève ce service en commun

## Règle: Un aperçu ne se fait qu'entre deux lieux existants

### Scénario: Un lieu introuvable empêche l'aperçu

* Étant donné deux lieux qui annoncent un même service
* Quand l'administration aperçoit la fusion du premier dans un lieu introuvable
* Alors l'aperçu est refusé faute de lieu
