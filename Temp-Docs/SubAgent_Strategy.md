# Sub-Agent Strategy: The Antigravity Ecosystem

To handle the complexity of the Antigravity Protocol, the Aetheris core will orchestrate a set of specialized sub-agents. These active components share the workload, enabling the system to scale its analytical depth without slowing down the 15-minute global OSINT sweep cycle.

## Sub-Agent Roles

### 1. Data Synthesizer Agent (The Observer)
**Task:** Rapid classification and entity extraction.
- Watches the raw `apis/sources/` streams.
- Cleans and structures the data (e.g., mapping a raw GDELT event to a specific geographic entity and severity score).
- Reduces the noise-to-signal ratio before data hits the primary correlation engine.

### 2. The Oracle Agent (Predictive Correlator)
**Task:** Finding the hidden ripples.
- Consumes the clean data from the Synthesizer.
- Uses advanced context windows (e.g., Gemini 3.1 Pro or Claude 3) to cross-reference seemingly unrelated data (like marine chokepoint AIS data + regional natural disasters + social sentiment).
- Calculates the "Gravity Score" (the probability of system failure in a specific domain).
- Outputs early-warning intelligence reports and risk trajectories.

### 3. The Antigravity Agent (Immunity Executor)
**Task:** Taking action.
- Listens for high Gravity Scores from The Oracle.
- Determines the necessary evasive action (e.g., reroute supply chain logic, hedge an options portfolio, trigger an AWS auto-scaling event).
- Formats payload JSON.
- Executes the webhook and verifies receipt via external system confirmation.

### 4. The Lazarus Agent (Self-Healing Overseer)
**Task:** System survival.
- A lightweight, distinct loop that constantly pulses the status of Aetheris's own endpoints, memory usage, and API keys.
- If it detects that The Oracle agent is hanging due to API rate limits, it hot-swaps the LLM provider or restarts the node without a system-wide reboot. 

## Implementation Notes
These agents will be implemented in the `lib/ai/` directory as distinct modular Javascript components that interact via an internal event bus, ensuring robust and asynchronous operations.
