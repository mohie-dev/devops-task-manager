# From Code to Cloud — Full-Stack Production Environment

An end-to-end production system built and operated from scratch: a backend API, fully containerized, deployed on hardened cloud infrastructure, with automated CI/CD and a complete observability & alerting stack.

This isn't just "code that runs" — it's a system designed for high availability, security, and full infrastructure-level transparency, the way real production systems need to be.

> Replace the badges below with your actual repo/CI links once published.

![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)
![Docker](https://img.shields.io/badge/Containerized-Docker-2496ED)
![Cloud](https://img.shields.io/badge/Deployed%20on-AWS%20EC2-orange)
![Monitoring](https://img.shields.io/badge/Observability-Prometheus%20%2B%20Grafana-e6522c)

---

## Table of contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Backend & data layer](#backend--data-layer)
- [Containerization](#containerization)
- [Cloud infrastructure (AWS EC2)](#cloud-infrastructure-aws-ec2)
- [CI/CD pipeline](#cicd-pipeline)
- [Observability & alerting](#observability--alerting)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Security notes](#security-notes)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

This project was built to go beyond "backend development" and cover the full lifecycle of a production system:

1. Writing the backend API with solid architectural practices
2. Containerizing the app for reproducible, isolated environments
3. Provisioning and hardening real cloud infrastructure
4. Automating build and deployment with CI/CD
5. Monitoring the system in real time and getting alerted the moment something goes wrong

The goal was to understand system bottlenecks, security boundaries, and real-time observability — not just to ship working code.

## Architecture

```
Developer ──push──▶ GitHub Actions ──build & test──▶ Docker Registry
                                                            │
                                                     pull & deploy
                                                            ▼
                                                    AWS EC2 (Ubuntu)
                                                            │
                     ┌──────────────────────────────────────┼──────────────────────────────────────┐
                     ▼                                      ▼                                      ▼
                  Nginx                                 API service                          PostgreSQL
             (SSL/TLS reverse proxy)                 (Dockerized backend)                  (persistent volume)
                                                            │
                                                            ▼
                                            Node Exporter ──▶ Prometheus ──▶ Grafana
                                                                    │
                                                                    ▼
                                                              Alertmanager
                                                                    │
                                                                    ▼
                                                             Telegram bot
                                                          (real-time incident alerts)
```

> Tip: swap this ASCII diagram for an actual exported image (`docs/architecture.png`) once you have one — GitHub renders images better than ASCII in the README preview.

## Tech stack

| Layer | Tools |
|---|---|
| Backend | Node.js / NestJS (or your framework), REST API |
| Database | PostgreSQL |
| Containerization | Docker, Docker Compose (multi-stage builds) |
| Reverse proxy / TLS | Nginx, Certbot |
| Cloud | AWS EC2 (Ubuntu), Security Groups, EBS |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus, Node Exporter, Grafana |
| Alerting | Alertmanager, Grafana Alert Rules (PromQL), Telegram Bot API |

## Backend & data layer

- Backend API built from scratch following clean architectural practices for high throughput and predictable data flow.
- Fully integrated with PostgreSQL for relational data persistence.

## Containerization

- **Multi-stage Dockerfiles** to keep image sizes small and build times fast.
- **Docker Compose** orchestrates all services (API, database, monitoring stack) and isolates container-to-container traffic on internal bridge networks.
- **Docker Volumes** persist stateful data for both the database and the monitoring services, so nothing is lost on container restarts.

## Cloud infrastructure (AWS EC2)

- Provisioned and hardened an AWS EC2 (Ubuntu) instance with strict Security Group ingress/egress rules — only the ports the system actually needs are open.
- Nginx runs as a reverse proxy in front of the app, terminating HTTPS with a Certbot-issued SSL/TLS certificate.
- Handled a live **EBS volume expansion** (`growpart` + `resize2fs`) directly on the running instance to relieve disk pressure caused by monitoring log ingestion — with zero downtime.

## CI/CD pipeline

A GitHub Actions workflow triggers on every push/merge to the main branch and:

1. Builds the Docker image(s)
2. Pushes the image to the container registry
3. Deploys to the EC2 instance with a zero-downtime rollout

```
push/merge → build → test → push image → deploy (zero downtime)
```

> Add your actual workflow file path here, e.g. `.github/workflows/deploy.yml`, and link it.

## Observability & alerting

The full stack is mounted to the host OS via system mounts, so metrics and dashboards survive container restarts.

- **Node Exporter** — exposes host-level metrics (CPU, memory, disk I/O, network).
- **Prometheus** — scrapes and stores real-time host and application metrics.
- **Grafana** — interactive dashboards visualizing CPU, memory, and disk I/O.
- **Alertmanager + Grafana Alert Rules** — PromQL-based alert rules that fire on high resource usage, routed instantly to a **Telegram bot** for real-time incident notification.

## Getting started

```bash
# clone the repo
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# copy env template and fill in your values
cp .env.example .env

# spin up the full stack locally
docker compose up -d --build

# check everything is running
docker compose ps
```

Once running:

| Service | Local URL |
|---|---|
| API | `http://localhost:<port>` |
| API docs (Swagger) | `http://localhost:<port>/docs` |
| Grafana | `http://localhost:3000` |
| Prometheus | `http://localhost:9090` |

## Environment variables

> Fill this in with your actual `.env.example` keys — never commit real secrets.

```env
# App
PORT=
NODE_ENV=

# Database
DATABASE_URL=

# Monitoring / Alerting
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## Security notes

- Sensitive credentials are never committed — see `.env.example` for the required keys.
- EC2 Security Group restricts inbound traffic to only the necessary ports (80/443 for web traffic, SSH restricted to a known IP).
- Nginx handles all public-facing traffic; internal services (DB, Prometheus, Grafana) are not directly exposed to the internet.
- No live/public link to the API is provided in this README to avoid exposing an unprotected endpoint — see the Swagger docs screenshot below instead, or reach out for a demo.


## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.