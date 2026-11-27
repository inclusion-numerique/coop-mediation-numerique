# Fonctionnalité: Rafraîchir le bloc rendez-vous de l’accueil

Quand l’accueil s’ouvre sur un compte dont des organisations n’ont pas de
webhook, la Coop rattrape leurs rendez-vous, puis ne relit l’accueil que si le
rattrapage a changé quelque chose.

## Règle: L’accueil n’est relu que si le rattrapage a changé quelque chose

### Scénario: Rattrapage sans changement

* Étant donné un compte RDV consultable à rafraîchir
* Et un rattrapage qui ne change rien
* Quand je rafraîchis l’accueil
* Alors l’accueil reste inchangé

### Scénario: Rattrapage qui change des rendez-vous

* Étant donné un compte RDV consultable à rafraîchir
* Et un rattrapage qui change 2 éléments
* Quand je rafraîchis l’accueil
* Alors l’accueil est relu avec une dérive de 2

## Règle: L’échec du rattrapage remonte tel quel

### Scénario: Rattrapage refusé

* Étant donné un compte RDV consultable à rafraîchir
* Et un rattrapage refusé
* Quand je rafraîchis l’accueil
* Alors le rafraîchissement échoue sur "NonAutorise"
