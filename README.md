# Ediat Garage — site de vente & back-office

Site de vente de **véhicules d'occasion importés de Corée** (Hyundai, Kia, SsangYong, Daewoo…), à Antananarivo,
avec un back-office pour gérer le stock et les demandes clients. Charte graphique tirée du logo EG : orange
`#E97135`, cyan `#00ADD7`, gris anthracite du fond du logo, titres en capitales condensées (Oswald), comme les
affiches Ediat Facility.

> Cette application est dans le dossier `ediat-garage/`, à côté du site 261 WEAR (racine du dépôt). Les deux sont
> indépendantes.

## Les trois disponibilités (fonctionnement « à la Moto Import »)

| Statut | Sur le site | Infos affichées |
| --- | --- | --- |
| **Disponible au showroom** (dispo de suite) | badge vert, en tête de liste, section dédiée sur l'accueil | « Réserver un essai » |
| **En cours d'arrivage** | badge cyan, section « Bientôt à Tana » | date d'arrivée prévue (« fin novembre ») |
| **Sur commande** | badge orange, catalogue d'import | délai (45 à 75 jours par défaut) et acompte |
| **Réservé** | visible, photo grisée | « Demander un modèle similaire » |
| **Vendu** | retiré du catalogue, visible dans « Récemment vendus » | fiche toujours accessible (preuve sociale) |
| **Brouillon** | invisible (404) | — |

Un véhicule ne peut pas être mis en ligne sans au moins une photo.

## Pages publiques

- **Accueil** : recherche rapide (disponibilité, marque, type, budget), les trois façons d'acheter, véhicules du
  showroom, bloc **Ediat Facility** « Roulez aujourd'hui, payez à votre rythme ! », arrivages, marques, import sur
  commande en 4 étapes, réassurance, récemment vendus.
- **/voitures** : catalogue avec filtres (disponibilité, marque, type, carburant, boîte, budget, année, km) et
  compteurs, recherche texte, tris, pastilles de filtres actifs, pagination. Rien ne correspond → « Le faire
  importer » ou WhatsApp.
- **/voitures/kia-sportage-…-12** : galerie photo (swipe), caractéristiques, équipements, prix, « à partir de … / mois »,
  simulateur Ediat Facility, demande d'essai / de rappel, véhicules similaires, barre WhatsApp + appel fixée en bas
  sur mobile, données structurées Google (schema.org `Car`).
- **/sur-commande** : déroulé de l'import, formulaire de recherche personnalisée (marque, modèle, année, budget…),
  exemples du catalogue sur commande, FAQ.
- **/financement** : page Ediat Facility, simulateur (prix, apport, durée), demande envoyée avec la simulation.
- **/contact** (et `/contact?sujet=reprise` pour la reprise) : formulaire, adresse, horaires, itinéraire.

Chaque formulaire enregistre une **demande** dans le back-office, puis propose de continuer sur WhatsApp.

## Back-office (`/admin`)

- **Tableau de bord** : stock par statut, valeur du showroom, ventes et marge du mois, demandes à traiter.
- **Véhicules** : liste avec recherche, onglets par statut, changement de statut direct ou groupé.
  Fiche véhicule : statut, photos (ordre, photo principale), marque/modèle/version, technique, prix, ancien prix
  barré, **prix de revient et notes privés** (jamais affichés), mensualité calculée ou imposée (ex. celle de
  l'affiche), équipements en un clic. Actions : **Copier le texte Facebook** (post prêt à coller avec prix,
  mensualité, lien), copier le lien, dupliquer, supprimer. Les demandes reçues sur ce véhicule sont listées à côté.
- **Demandes** : toutes les demandes (intérêt, essai, sur commande, financement, reprise, contact) avec statut
  Nouveau / En cours / Conclu / Sans suite, note interne, bouton **Répondre sur WhatsApp** (message pré-rempli).
- **Paramètres** : WhatsApp, téléphone, adresse, horaires, lien Google Maps, bandeau d'annonce, réseaux sociaux,
  délai et acompte des commandes, réglages **Ediat Facility** (apport minimum, taux annuel, durées, arrondi,
  conditions) avec exemple de calcul.

### Calcul de la mensualité

```
mensualité = (prix − apport) × t / (1 − (1 + t)^−n)    t = taux annuel / 12, n = durée en mois
             (prix − apport) / n                         si le taux est 0
```

« À partir de … / mois » = apport minimum et durée la plus longue, arrondi au-dessus (5 000 Ar par défaut), sauf
si une mensualité est saisie sur le véhicule. Réglages par défaut : apport 30 %, 18 %/an, 6 à 24 mois.

## Lancer en local

```bash
cd ediat-garage
npm install
npm run dev          # http://localhost:3000 — back-office : /admin (mot de passe local : ediat)
```

En local, la base (PGlite) et les photos sont stockées dans `ediat-garage/.data/`.

## Mise en ligne sur Vercel

1. **Add New → Project**, importer ce dépôt GitHub, et régler **Root Directory = `ediat-garage`**.
2. **Storage → Neon (Postgres)** : créer une base et la connecter au projet (ajoute `DATABASE_URL`).
3. **Storage → Blob** : créer un store et le connecter (ajoute `BLOB_READ_WRITE_TOKEN`) pour les photos.
4. **Settings → Environment Variables** : `ADMIN_PASSWORD` (long et secret), et `SITE_URL` une fois le nom de
   domaine branché (ex. `https://ediatgarage.mg`).
5. Déployer, puis aller sur `/admin/parametres` pour mettre le vrai numéro WhatsApp, l'adresse et les horaires.

Les tables sont créées automatiquement au premier chargement.

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Base Postgres (Neon). Absente en local → PGlite dans `.data/`. |
| `BLOB_READ_WRITE_TOKEN` | Stockage des photos (Vercel Blob). Absent en local → `.data/uploads/`. |
| `ADMIN_PASSWORD` | Mot de passe du back-office (obligatoire en production). |
| `ADMIN_SECRET` | Optionnel : clé de signature des sessions (sinon dérivée du mot de passe). |
| `SITE_URL` | Optionnel : adresse publique utilisée dans les liens partagés et le sitemap. |

## Technique

Next.js 16 (App Router, Server Actions), Tailwind CSS 4, Neon Postgres / PGlite, Vercel Blob.
Le site public est servi depuis le cache (relu au plus une fois par heure, et immédiatement après chaque
modification dans le back-office) : les visiteurs ne réveillent pas la base. Photos réduites dans le navigateur
avant envoi (1600 px + miniature 720 px). Formulaires publics : champ piège anti-robots et 8 demandes / heure par
connexion. Connexion au back-office limitée à 10 essais / 15 min.
