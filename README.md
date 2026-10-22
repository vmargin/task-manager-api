# Task Manager API

**An Express and PostgreSQL learning project for authenticated, user-owned tasks.**

This backend pairs with the [React task-manager client](https://github.com/vmargin/task-manager-client). It implements registration, JWT login, and task creation, retrieval, updates, and deletion using Prisma.

> **Hosted status, October 22, 2026:** the former health endpoint, https://task-manager-api-7po6.onrender.com/health, returns HTTP 503. A reachable frontend does not establish a working full-stack demo. Use a local database and server for development.

## Architecture

```text
React client → Express routes → JWT middleware → Prisma → PostgreSQL
```

`src/server.js` contains the routes and starts the server. `src/middleware/auth.js` checks bearer tokens. Task queries and changes check the authenticated user's ownership. Passwords are hashed with bcrypt; JWTs expire after one day.

**Stack:** JavaScript, Node.js, Express 5, Prisma 6, PostgreSQL, bcrypt, JSON Web Tokens. Despite the repository language statistics, the handwritten runtime is JavaScript; the removed TypeScript output was an obsolete generated client.

## Run locally

Use Node.js 24 and an empty PostgreSQL development database:

```powershell
git clone https://github.com/vmargin/task-manager-api.git
cd task-manager-api
npm ci
Copy-Item .env.example .env
```

Fill `DATABASE_URL` and a private random `JWT_SECRET` in the ignored `.env`. `PORT` is optional and defaults to 3000. Then:

```powershell
npx prisma generate
npx prisma migrate deploy
node src/server.js
```

Use migrations only against your dedicated development database. Do not reset an existing database. No start, build, or passing test script is currently defined in `package.json`.

## API surface

JSON request bodies use `Content-Type: application/json`. Protected routes require `Authorization: Bearer <token>`.

| Method | Path | Purpose | Authentication |
| --- | --- | --- | --- |
| GET | `/health` | Process liveness; does not query the database. | Public |
| POST | `/users` | Register with `email` and `password`, minimum six characters. | Public |
| POST | `/login` | Exchange `email` and `password` for a JWT. | Public |
| GET | `/tasks` | List the current user's tasks. | Bearer token |
| POST | `/tasks` | Create with `title` and `description`; initial status is `todo`. | Bearer token |
| GET | `/tasks/:id` | Read an owned task. | Bearer token |
| PUT / PATCH | `/tasks/:id` | Update title, description, and status of an owned task. | Bearer token |
| DELETE | `/tasks/:id` | Delete an owned task. | Bearer token |

## Checks and limitations

```powershell
node --check src/server.js
node --check src/middleware/auth.js
npx prisma validate
```

There is no automated behavior suite. `npm test` is the original failing placeholder. This project is not production-ready: input validation and error handling are limited, CORS is unrestricted, and registration currently returns the saved user record including its password hash. Use synthetic accounts only and do not treat the response as a safe production contract.

The paired client exposes list/create/delete workflows; it does not implement every backend endpoint. Its API base URL is hardcoded and must be changed locally to use this server. Runtime/security improvements are outside this documentation refresh.

---

[More projects](https://github.com/vmargin) · [Portfolio](https://vmargin.github.io/) · [LinkedIn](https://www.linkedin.com/in/vmargin/)
