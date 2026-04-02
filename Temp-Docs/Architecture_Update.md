# Transforming Architecture: From Veritas to Veritas

To transition from the base Veritas repository into **Veritas: The Reality Engine**, several core architectural components have been wholly repurposed.

## 1. Injecting the Claim Engine (AI Analysis Node)
*Current Flow:* `apis/sources/` -> Notification Engine -> Dashboard
*Veritas Flow:* Viral Claim (Telegram/Dashboard) -> `apis/sources/` -> **Veritas Claim Engine** -> Truth Proof Webhook -> Output

We added a specialized processing node (`lib/ai/veritas.mjs`) between the raw data sources and the notification engine. Rather than passively aggregating data, this node intercepts viral narratives, commands a 27-source physical sweep, and mathematically cross-references the findings using an LLM.

## 2. Reality Scores and Truth Proofs
The standard dashboard logic was upgraded to produce **Reality Scores** (0-100% confidence). 
These scores represent the mathematical probability that an online rumor is physically true, based entirely on planetary sensors. This pivots the UI from a retrospective view of "what happened" to an active tool for distinguishing fact from deepfake fiction.

## 3. Automated Decentralized Truth Webhooks
The existing Discord and Telegram alert systems currently act as passive notifications. We expanded the alerting engine to include the **WebhookExecutor** (`lib/alerts/webhook.mjs`).
- If a viral narrative is confirmed as "VERIFIED" or "DEBUNKED" (but not UNVERIFIABLE), the executor immediately fires an API payload.
- **Goal:** To instantly push "Truth Proofs" to automated social media bots, fact-checking ledgers, or public API subscribers seconds after the physical sensor data proves a deepfake wrong.

## 4. Self-Healing State Management
To ensure the Truth Oracle is unstoppable, Project Lazarus loops internally monitor the state of the 27 APIs.
- If a specific sensor API goes offline (e.g., NASA FIRMS is down), the engine gracefully degrades, warning the LLM that the thermal physical sensor is blind, without crashing the main system.
