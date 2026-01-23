# Multiplayer Raycaster Engine  
### Flask • HTML Canvas • Online Multiplayer

A **Flask-based web application** hosting an **optimised online multiplayer 3D raycaster engine** built entirely on an **HTML Canvas** renderer.

The project combines a **high-performance client-side engine**, real-time multiplayer networking, and a **secure, API-driven backend**, designed for responsiveness, scalability, and low memory overhead.

<img width="350" height="275" alt="image" src="https://github.com/user-attachments/assets/74c1a6b9-99cf-40f7-9d9d-615717555c30" /> <img width="350" height="275" alt="image" src="https://github.com/user-attachments/assets/0527e1cf-b3e0-4a22-bef7-8d56c82db4fb" />

**TRY FOR YOURSELF:** https://pixel-world-298d11ef6df1.herokuapp.com/

---

## 🎮 Overview

This platform delivers a classic raycasting-style 3D engine with modern features:

- Smooth 60 FPS client tick
- Multiplayer world replication
- Modular engine architecture
- Secure, production-ready backend
- REST-driven services and asset pipelines

The system is designed to run efficiently in-browser while supporting multiple concurrent players.

**DEMO VIDEO:** https://github.com/user-attachments/assets/59f46060-d52b-4906-bff6-014e86002822

---

## 🧩 Tech Stack

### Backend
- **Framework:** Flask + Flask Dependencies
- **Database:** MongoDB
- **Auth & Security:** Werkzeug, CSRF protection, Google reCAPTCHA
- **Networking:** UDP-style WebSocket replication
- **Templating:** Jinja2

### Frontend
- **Rendering:** P5.js + HTML Canvas (Raycasting)
- **UI:** JINJA2 + Bootstrap + layered custom CSS
- **Audio:** Web Audio API
- **Input:** Keyboard + Mouse

---

## 🧠 Engine Design

### Core Principles
- Modular architecture
- Memory-efficient data structures
- Minimal shared resources between client and server
- Explicit update and render pipelines

---

### ⏱️ Order of Operations

1. **Client Tick (Target: 60 FPS)**
2. Input Processing
3. Physics & Collision Resolution
4. Camera Update
5. Raycasting & Wall Projection
6. Lighting & Shader Application
7. UI Rendering
8. Network Sync

Some effects are intentionally capped at **30 FPS** to reduce processing cost.

---

## 🎮 Controls

| Action | Input |
|------|------|
| Move | WASD |
| Sprint | Hold Shift |
| Look | Mouse movement |
| Toggle FOV | Z & X |
| Toggle Resolution | Q & E |

<img width="310" height="154" alt="image" src="https://github.com/user-attachments/assets/e197d931-d18d-4cb4-a385-e1a1eda0783d" />

---

## 🧍 Character Controller

- Adjustable base movement speed
- Sprint speed multiplier
- Collision-aware physics
- Head-bob effect for movement feedback

---

## 🎥 Camera System

- Dynamic **FOV control**
- Resolution scaling
- Height projection (Y-axis relative to canvas height)
- Head bobbing synced to movement
- Optimised projection math with rounded precision

<img width="200" height="200" alt="image" src="https://github.com/user-attachments/assets/4f976735-5817-48c9-8ec7-c372a7b25d81" />
<br />
<img width="250" height="254" alt="image" src="https://github.com/user-attachments/assets/32960ae0-cb46-4969-b4a4-4b4182ee1c9f" />
<img width="250" height="254" alt="image" src="https://github.com/user-attachments/assets/e2e03de8-7eab-4094-b302-48cfa196243b" />
<img width="250" height="254" alt="image" src="https://github.com/user-attachments/assets/c824bd7f-f99d-45cd-af26-aecdb2d52a2d" />
<img width="250" height="254" alt="image" src="https://github.com/user-attachments/assets/ad6ac77d-922c-42f3-93be-c7b7f38a8cb3" />

---

## 🔊 Sound System

- Responsive footsteps
- Collision-based sound triggers
- Distance-aware volume scaling
- Lightweight audio pooling

<img width="212" height="331" alt="image" src="https://github.com/user-attachments/assets/5c99879f-0d3f-4c69-a381-0b22e531bf83" />

---

## 💡 Lighting & Shading

- Shader cache system for brightness maps
- Pixel-based lighting interpolation
- Accuracy rounding for performance
- Floor & sky gradient rendering to contrast world geometry

<img width="200" height="200" alt="image" src="https://github.com/user-attachments/assets/12b3ae46-6404-44fa-8184-c5359f0ed772" />
<br />
<img width="300" height="221" alt="image" src="https://github.com/user-attachments/assets/b0a54203-490c-4d58-b806-bc2ac5175032" />
<img width="300" height="221" alt="image" src="https://github.com/user-attachments/assets/d5ba8d6d-ed7a-45e0-9108-d96bdee1f38f" />
<img width="300" height="221" alt="image" src="https://github.com/user-attachments/assets/95d338e2-e215-4c34-ac2e-dbf3406347be" />


---

## 🗺️ UI Systems

- **Minimap**
  - Displays world layout
  - Shows active raycasts from player
- **FPS Counter**
  - Live performance monitoring
 
<img width="110" height="52" alt="image" src="https://github.com/user-attachments/assets/8c1a45a4-8ac0-4b65-a7da-5b42efe47ff4" />
<br />
<img width="300" height="221" alt="image" src="https://github.com/user-attachments/assets/bd3f87c4-5765-403d-a1b9-1f047662f2ad" />
<img width="300" height="221" alt="image" src="https://github.com/user-attachments/assets/14781d50-8f11-454c-9261-088f27a3cb40" />
<img width="300" height="221" alt="image" src="https://github.com/user-attachments/assets/cece9e15-a289-4d41-922b-479c0a6cb873" />

---

## 🌐 Multiplayer Networking

- UDP-style WebSocket client/server replication
- Character state replication
- Real-time world synchronisation
- Live side-chat for players
- Browser idle timeout & auto-disconnect

<img width="118" height="275" alt="image" src="https://github.com/user-attachments/assets/e53c8788-4b4f-42ed-93d3-39e6deb6a4d8" />

### Logging & Events
- Join / leave logging
- Chat logging
- Webhook to Discord Channels

<img width="350" height="275" alt="image" src="https://github.com/user-attachments/assets/8e205b54-60b2-4b21-a7b6-a69a427519e3" />

---

## 🧵 Server Architecture

- Each game **world/server runs on its own thread**
- Isolated state per world
- Scalable multi-instance hosting
- Low shared memory overhead

<img width="350" height="275" alt="image" src="https://github.com/user-attachments/assets/03fd8d3a-515a-4689-80b0-4588341628b6" />

---

## 🔌 REST API

### API Design
- Version-controlled (`/api/v1`)
- Blueprint-based (modular & stackable)
- Resource & sub-resource structure
- JSON request / response format

### Features
- Global TTL caches for fast data serving
- Token-based authentication
- Role-based access control
- Requests denied without valid tokens
- Hidden stack traces on errors
- Sanitised error responses

---

## ⚡ Optimisations

- Shader brightness caches
- Rounded numeric calculations
- FPS-bound update methods
- Adjacent wall removal on map generation
- 16×16 textures with pixel skipping based on LOD
- Max render distance to skip far walls
- Browser idle disconnects to save bandwidth and CPU
- Texture RGB pixel data fetched via API

<img width="905" height="258" alt="image" src="https://github.com/user-attachments/assets/54a86689-fb39-42e3-8992-0a0d62e48623" />

---

## 🔐 Website Security

Security is implemented at every layer:

- Session tokens stored in secure cookies
- Secure server-side forms
- Cryptographic hashing via Werkzeug
- Google reCAPTCHA protection
- CSRF prevention
- Input sanitisation
- User access levels
- Multi-factor authentication via email (Gmail bot)
- Environment variable loading for sensitive data
- NoSQL storage via MongoDB DQL to eliminate SQL injection vectors

<img width="350" height="275" alt="image" src="https://github.com/user-attachments/assets/026f30fa-34ca-4235-9bbc-46dea58603b3" />

---

## 👤 Account Management

- Register accounts
- Login / Logout
- Edit / Update profiles
- Delete accounts
- Role-based access enforcement

<img width="350" height="275" alt="image" src="https://github.com/user-attachments/assets/fa8b37c7-e0d9-48fa-8b84-57b14aaa9c13" />

---

## 🎨 Frontend Architecture

- Responsive layouts via Bootstrap
- Layered CSS structure
- Jinja2 layered templating
- Reactive UI updates without full reloads

---

## 🛠️ Configuration

- Sensitive data loaded via environment variables
- API keys and secrets never hardcoded
- Configurable per-environment settings

---

## ✨ Notes

This project demonstrates:

- Advanced browser-based rendering
- Real-time multiplayer networking
- Secure Flask backend design
- Performance-driven engine optimisation
- Clean separation between engine, network, and API layers

A strong foundation for **browser-based multiplayer engines, experiments, or game tech portfolios**.
