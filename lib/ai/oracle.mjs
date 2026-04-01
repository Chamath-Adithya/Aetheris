// The Oracle: AI Analysis Node for the Antigravity Protocol
// Analyzes OSINT data to predict ripple effects and generate a Gravity Score and evasive actions.

/**
 * Generates a Gravity Report using an LLM.
 * @param {LLMProvider} provider - The configured LLM provider.
 * @param {object} sweepData - Synthesized dashboard OSINT data.
 * @param {object|null} delta - Delta from the last sweep.
 * @returns {Promise<object|null>} - The Gravity Report JSON.
 */
export async function generateGravityReport(provider, sweepData, delta) {
  if (!provider?.isConfigured) return null;

  let context;
  try {
    // We reuse the existing ideas compacting logic for efficiency, 
    // or just pass a stringified high-level summary.
    // Since we don't want to duplicate 150 lines of compacting code, 
    // we'll intelligently extract the key warning flags.
    context = extractRiskContext(sweepData, delta);
  } catch (err) {
    console.error('[Oracle] Failed to build risk context:', err.message);
    return null;
  }

  const systemPrompt = `You are "The Oracle", the core AI Analysis Node of the Aetheris Antigravity Protocol. 
Your primary task is to find hidden correlations in the provided massive global OSINT dataset and predict systemic ripple effects before they happen.

Based on the provided OSINT data and recent deltas, output a strict JSON payload representing the current systemic risk (Gravity).

Rules:
- gravityScore must be an integer between 0 and 100 representing global systemic risk (0 = perfect harmony, 100 = total global system failure).
- criticalSectors should be an array of strings naming specific global systems under imminent threat (e.g., "Pacific Shipping", "European Energy Grid").
- evasiveActions must be an array of specific, executable JSON payloads designed for a downstream webhook to ingest. 
- Only include "evasiveActions" if the gravityScore > 65. If <= 65, return an empty array for actions.

Output ONLY valid JSON. 
Format:
{
  "gravityScore": 45,
  "rationale": "Brief 1 sentence explanation of why this score was chosen.",
  "criticalSectors": ["Crypto Markets", "Global Supply Chain"],
  "evasiveActions": [
    { "type": "reroute_logistics", "target": "asia_pacific", "urgency": "high" },
    { "type": "portfolio_hedge", "target": "energy_sector", "urgency": "medium" }
  ]
}`;

  try {
    const result = await provider.complete(systemPrompt, context, { maxTokens: 2048, timeout: 60000 });
    const report = parseOracleResponse(result.text);
    if (report) return report;
    
    console.warn('[Oracle] No valid JSON parsed from LLM response.');
    return null;
  } catch (err) {
    console.error('[Oracle] Generation crashed:', err.message);
    return null;
  }
}

/**
 * Extracts high-risk context from the sweep data.
 */
function extractRiskContext(data, delta) {
  const flags = [];
  
  // Market pressure
  const vix = data.fred?.find(f => f.id === 'VIXCLS');
  if (vix && vix.value > 20) flags.push(`HIGH VIX: ${vix.value}`);
  
  if (data.energy) {
    flags.push(`ENERGY PRICES: WTI=$${data.energy.wti}, Brent=$${data.energy.brent}, NatGas=$${data.energy.natgas}`);
  }

  // Supply chain
  if (data.gscpi && data.gscpi.value > 0) {
    flags.push(`SUPPLY CHAIN PRESSURE: ${data.gscpi.value} (${data.gscpi.interpretation})`);
  }

  // OSINT (Telegram Urgent)
  if (data.tg?.urgent?.length > 0) {
    flags.push(`URGENT CHATTER:\n` + data.tg.urgent.slice(0, 3).map(u => `- ${u.text}`).join('\n'));
  }

  // Structural anomalies
  if (data.nuke?.some(n => n.anom)) flags.push(`RADIATION ANOMALY DETECTED`);
  if (data.thermal?.some(t => t.det > 50)) flags.push(`MASSIVE THERMAL ANOMALIES DETECTED`);

  if (delta?.summary) {
    flags.push(`DELTA: Direction=${delta.summary.direction}, Critical Changes=${delta.summary.criticalChanges}`);
  }

  if (flags.length === 0) return "No significant anomalies across 27 sources.";
  return flags.join('\n\n');
}

/**
 * Parses the raw LLM output into the Gravity Report object.
 */
function parseOracleResponse(text) {
  if (!text) return null;
  
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    
    // Ensure shape
    if (typeof parsed.gravityScore !== 'number') return null;
    
    return {
      gravityScore: parsed.gravityScore,
      rationale: parsed.rationale || 'No rationale provided.',
      criticalSectors: Array.isArray(parsed.criticalSectors) ? parsed.criticalSectors : [],
      evasiveActions: Array.isArray(parsed.evasiveActions) ? parsed.evasiveActions : []
    };
  } catch {
    // regex fallback
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const obj = JSON.parse(match[0]);
        if (typeof obj.gravityScore !== 'number') return null;
        return obj;
      } catch { return null; }
    }
    return null;
  }
}
