# FleetManager — Gestion de flotte automobile

Application complete de gestion de flotte : vehicules, chauffeurs, affectations, et 4 types de
saisies terrain (versements, vidanges, recharges GPS, depenses). Gestion des utilisateurs par
roles **ADMIN / SUPERVISEUR / AGENT**, avec vue 360 pour le superviseur.

## Stack technique

| Couche      | Techno |
|-------------|--------|
| Frontend    | Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 (inchange) |
| Backend     | Java 17 + Spring Boot 3 + Spring Security (JWT) + Spring Data JPA |
| Base de donnees | PostgreSQL 16 (migrations Flyway) |
| Deploiement | Docker + docker-compose |

## Arborescence

```
fleetmanager/
├── backend/            # API Spring Boot (Java 17)
├── frontend/           # Application Next.js (React)
├── docker-compose.yml  # Orchestration complete (postgres + backend + frontend)
└── .env.example        # Variables d'environnement a copier en .env
```

## Demarrage rapide (Docker)

```bash
cd fleetmanager
cp .env.example .env
# Editer .env : definir APP_JWT_SECRET et APP_BOOTSTRAP_ADMIN_PASSWORD au minimum

docker compose up --build
```

- Frontend : http://localhost:3000
- Backend (API + Swagger) : http://localhost:8080/swagger-ui.html
- PostgreSQL : localhost:5432

Au premier demarrage, un compte **ADMIN** est cree automatiquement avec les identifiants
`APP_BOOTSTRAP_ADMIN_EMAIL` / `APP_BOOTSTRAP_ADMIN_PASSWORD` definis dans `.env`. Connectez-vous
avec ce compte pour creer les autres utilisateurs (Superviseurs, Agents) depuis le menu
"Gestion utilisateurs".

## Roles et permissions

| Action | ADMIN | SUPERVISEUR | AGENT |
|--------|:---:|:---:|:---:|
| Gestion des utilisateurs | ✅ | ❌ | ❌ |
| Creer / modifier vehicules | ✅ | ✅ | ❌ |
| Supprimer un vehicule | ✅ | ❌ | ❌ |
| Gerer chauffeurs & affectations | ✅ | ✅ | ✅ (creation) |
| Saisir versement / vidange / GPS / depense | ✅ | ✅ | ✅ |
| Modifier / supprimer une saisie | ✅ | ✅ | ❌ |
| **Vue 360 (toutes les saisies, tous agents)** | ✅ | ✅ | ❌ (ne voit que ses propres saisies) |

La regle est appliquee **cote backend** (Spring Security `@PreAuthorize` + filtrage par
`createdBy` dans les services), pas seulement dans l'interface : un agent ne peut pas contourner
la restriction en appelant l'API directement.

## Securite / session

- Authentification par JWT (access token courte duree + refresh token).
- **Deconnexion automatique** : a l'expiration de l'access token, le frontend tente un
  rafraichissement silencieux ; s'il echoue (refresh token egalement expire/invalide),
  l'utilisateur est deconnecte et redirige vers `/login` avec un message explicite.
- Mots de passe hashes en BCrypt cote backend, jamais stockes en clair.

## Developpement local (sans Docker)

### Backend
```bash
cd backend
# Necessite un PostgreSQL local (ou lancer juste le service postgres via docker compose)
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/fleetmanager
export APP_JWT_SECRET=dev-secret-change-me-please-1234567890
export APP_BOOTSTRAP_ADMIN_PASSWORD=Admin@12345
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
pnpm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
pnpm dev
```

> ⚠️ Le backend n'a pas pu etre compile dans l'environnement de generation (pas d'acces a Maven
> Central). Lancez `mvn -B clean verify` en premier pour detecter d'eventuelles erreurs de
> compilation avant le premier deploiement.

## Revue d'architecture

### Frontend (existant, conserve)
L'architecture d'origine (`frontend/ARCHITECTURE.md`) suit un decoupage en couches propre :
Presentation (`components/`) → Etat/logique (`hooks/use-fleet-data.ts`) → Acces donnees
(`lib/store.ts`) → Modele (`lib/types.ts`). C'est un pattern **Container/Presentational** correct
pour une app React. Seul manque reel : l'absence de backend et d'authentification reelle, corrige
ici en :
- remplacant `lib/store.ts` (localStorage) par `lib/fleet-api.ts` (appels HTTP), en conservant
  la meme interface de fonctions pour limiter l'impact sur les composants existants ;
- ajoutant une couche transverse d'authentification (`lib/auth-context.tsx`,
  `lib/api-client.ts`, `lib/token-storage.ts`) suivant le pattern **Provider/Context** standard
  en React, avec interception centralisee des erreurs 401.

### Backend (nouveau)
Architecture en couches classique Spring Boot, par domaine metier (package-by-feature) :

```
Controller (REST, validation, @PreAuthorize)
    ↓
Service (logique metier, transactions)
    ↓
Repository (Spring Data JPA)
    ↓
Entity (JPA) ←→ PostgreSQL (migrations Flyway versionnees)
```

- **DTO pattern** systematique : aucune entite JPA n'est exposee directement dans l'API (limite
  le couplage et les fuites de donnees).
- **Separation authn/authz** : `security/` (JWT, filtres) est independant des packages metier.
- **Injection par constructeur** (`@RequiredArgsConstructor`), pas de champs mutables partages.
- **Gestion d'erreurs centralisee** (`GlobalExceptionHandler`) avec format de reponse uniforme.
- Chaque domaine (`user`, `driver`, `vehicle`, `assignment`, `operation`, `alert`, `dashboard`)
  est autonome : controller + service + repository + dto dans son propre package, ce qui facilite
  l'evolution vers une decoupe en microservices si le besoin se presentait.

## Endpoints principaux

| Methode | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Connexion (retourne access + refresh token) |
| POST | `/api/auth/refresh` | Rafraichissement de session |
| GET | `/api/auth/me` | Utilisateur courant |
| GET/POST/PUT/DELETE | `/api/users` | Gestion utilisateurs (ADMIN) |
| GET/POST/PUT/DELETE | `/api/vehicles` | Vehicules |
| GET/POST/PUT/DELETE | `/api/drivers` | Chauffeurs |
| GET/POST | `/api/assignments` | Affectations chauffeur ↔ vehicule |
| GET/POST/PUT/DELETE | `/api/payments`, `/api/oil-changes`, `/api/gps-recharges`, `/api/expenses` | Saisies (filtrees par role) |
| GET | `/api/operations` | **Vue 360** transversale (filtres date/vehicule/chauffeur/type) |
| GET | `/api/operations/export` | Export CSV de la vue 360 |
| GET | `/api/alerts` | Alertes calculees (vidange, expiration GPS) |
| GET | `/api/dashboard/stats` | KPIs du tableau de bord |

Documentation interactive complete : `/swagger-ui.html` une fois le backend lance.
