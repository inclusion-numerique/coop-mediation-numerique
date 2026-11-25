# Fonctionnalité: Consulter ses rendez-vous depuis l'accueil

## Règle: L'accueil compte les rendez-vous à venir et les rendez-vous en attente

### Scénario: Rendez-vous à venir

* Étant donné un compte RDV consultable
* Et un rendez-vous "unknown" dans 3 jours
* Quand je consulte l’accueil
* Alors l’accueil annonce 1 rendez-vous à venir
* Et l’accueil annonce 0 rendez-vous passé

### Scénario: Rendez-vous échu sans présence saisie

* Étant donné un compte RDV consultable
* Et un rendez-vous "unknown" il y a 3 jours
* Quand je consulte l’accueil
* Alors l’accueil annonce 1 rendez-vous passé
* Et l’accueil annonce 0 rendez-vous à venir

### Scénario: Rendez-vous honoré en attente de compte rendu

* Étant donné un compte RDV consultable
* Et un rendez-vous "seen" il y a 3 jours
* Quand je consulte l’accueil
* Alors l’accueil annonce 1 rendez-vous passé

### Scénario: Rendez-vous honoré dont le compte rendu a été écarté

* Étant donné un compte RDV consultable
* Et un rendez-vous "seen" il y a 3 jours dont le CRA a été écarté
* Quand je consulte l’accueil
* Alors l’accueil annonce 0 rendez-vous passé

### Scénario: Rendez-vous annulé

* Étant donné un compte RDV consultable
* Et un rendez-vous "revoked" il y a 3 jours
* Quand je consulte l’accueil
* Alors l’accueil annonce 0 rendez-vous passé
* Et l’accueil annonce 0 rendez-vous à venir

### Scénario: Le prochain rendez-vous mis en avant est le plus proche

* Étant donné un compte RDV consultable
* Et un rendez-vous "unknown" dans 10 jours
* Et un rendez-vous "unknown" dans 2 jours
* Quand je consulte l’accueil
* Alors le prochain rendez-vous mis en avant commence dans 2 jours

## Règle: L'accueil n'affiche des données que pour un compte exploitable

### Scénario: Compte en erreur

* Étant donné un compte RDV en erreur à consulter
* Quand je consulte l’accueil
* Alors l’accueil affiche une alerte

### Scénario: Compte délié

* Étant donné un compte RDV délié à consulter
* Quand je consulte l’accueil
* Alors l’accueil masque le bloc rendez-vous

### Scénario: Médiateur sans compte RDV

* Étant donné aucun compte RDV à consulter
* Quand je consulte l’accueil
* Alors l’accueil masque le bloc rendez-vous
