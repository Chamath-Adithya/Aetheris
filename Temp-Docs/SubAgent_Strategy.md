# Sub-Agent Strategy: The Veritas Ecosystem

To handle the complexity of the Fact-Checking Protocol, the Veritas core architecture orchestrates a set of specialized sub-agents. These active components share the workload, enabling the system to scale its analytical depth.

## Sub-Agent Roles

### 1. The Sensor Agents (The Physical Sweepers)
**Task:** Raw planetary observation.
- Instead of one monolith, these are 27 distinct modules located in `apis/sources/`.
- They are completely agnostic to the news. They only care about raw math: How many airplanes are in Sector X? How many fires are in grid Y?
- They pull data in parallel every 15 minutes, unaffected by social media sentiment.

### 2. The Claim Interceptor (Synthesizer)
**Task:** Finding the viral narrative.
- Watches the `tg` (Telegram) datastreams or an active dashboard input.
- Isolates the single most urgent, rapidly spreading, high-anxiety claim (e.g., "Explosions are happening right now in Taiwan!").
- Packages the claim and hands it downstream.

### 3. Veritas (The Reality Engine / Truth Oracle)
**Task:** Fact-checking the claim mathematically.
- Exists in `lib/ai/veritas.mjs`.
- Receives the viral claim from the Interceptor.
- Looks exclusively at the data provided by the 27 Sensor Agents.
- Refuses to use pre-trained internet knowledge. 
- Calculates the "Reality Score" (the probability that the claim matches the physical data) and writes a human-readable "Truth Proof" explaining why the deepfake is false or the news is true.

### 4. The Publisher (Webhook Executor)
**Task:** Defeating the propaganda in real-time.
- Exists in `lib/alerts/webhook.mjs`.
- If Veritas determines a high-confidence proof, the Publisher triggers safe POST requests.
- It can be hooked into a decentralized blockchain, an AWS Lambda function, or an automated Twitter bot to fight the disinformation algorithmically.
