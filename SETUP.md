# Local Development Setup Guide

## What you need installed

1. **Node.js** version 18 or newer — https://nodejs.org
2. **npm** (comes with Node.js automatically)
3. **PostgreSQL** version 14 or newer — https://www.postgresql.org/download

---

## Step 1 — Create the PostgreSQL database

Open pgAdmin or the `psql` command-line tool and run:

```sql
CREATE DATABASE tunisair_audit;
```

Then load the schema (from the project root, or adjust the path):

```bash
psql -U postgres -d tunisair_audit -f apps/web/database-schema.sql
```

Replace `postgres` with your PostgreSQL username if it is different.

---

## Step 2 — Create the environment file

Create a file called `.env.local` inside the `apps/web` folder.
Paste this content and fill in your values:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/tunisair_audit
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

---

## Step 3 — Install all dependencies

Open a terminal at the root of the project and run:

```bash
npm install
```

---

## Step 4 — Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

---

## Default admin credentials

After running the schema, the admin account is:

- **Email:** Haifa.SDIRI@tunisair.com.tn
- **Password:** password

Change this immediately in any production environment.

---

## User roles explained

| Role | What they can access |
|------|---------------------|
| `admin` | Everything |
| `audit_manager` | Dashboard, All Audits, Calendar, Report Issue, Manage Audits, Yearly Plan |
| `quality_safety_manager` | Dashboard, All Audits, Calendar, Report Issue, Review Issues |
| `auditee` | Dashboard, All Audits, Calendar, Report Issue only |

---

## Common problems

**"Cannot connect to database"**
Make sure PostgreSQL is running. On Windows you can start it from pgAdmin.
On Mac: `brew services start postgresql`
On Linux: `sudo systemctl start postgresql`

**"Port 3000 already in use"**
Run on a different port: `npm run dev -- --port 3001`

**"Module not found" errors**
Delete the `node_modules` folder and run `npm install` again.

**Schema errors about "already exists"**
That just means the tables were already created — it is safe to ignore.
