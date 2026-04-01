// Project Veritas: The Reality Engine
// Analyzes OSINT data against physical planetary sensors to fact-check viral claims.

/**
 * Generates a Truth Proof and Reality Score for the most urgent current narrative.
 * @param {LLMProvider} provider - The configured LLM provider.
 * @param {object} sweepData - Synthesized dashboard OSINT data.
 * @param {object|null} delta - Delta from the last sweep.
 * @returns {Promise<object|null>} - The Truth Proof JSON.
 */
export async function evaluateReality(provider, sweepData, delta) {
  if (!provider?.isConfigured) return null;

  // We only care about verifying reality if there is an active urgent claim.
  const urgentClaims = sweepData.tg?.urgent || [];
  if (urgentClaims.length === 0) {
    console.log('[Veritas] No active viral claims to evaluate.');
    return null;
  }

  // Take the top claim
  const activeClaim = urgentClaims[0].text;

  let context;
  try {
    context = extractPhysicalSensorContext(sweepData);
  } catch (err) {
    console.error('[Veritas] Failed to build sensor context:', err.message);
    return null;
  }

  const systemPrompt = `You are "Veritas", an Autonomous Truth Oracle. 
Your singular purpose is to fact-check the provided viral social media claim by mathematically cross-referencing it ONLY against the provided physical planetary sensor data. Do not use outside knowledge. Rely exclusively on the physical data provided.

Viral Claim Under Investigation:
"${activeClaim}"

Provided Physical Sensor Data:
${context}

Rules:
- Give a 'realityScore' (0-100) representing the mathematical certainty that the physical data proves the claim. (100 = Absolute physical proof, 0 = Physical data directly contradicts the claim, 50 = Unverifiable).
- 'verdict' must be exactly one of: "VERIFIED", "DEBUNKED", or "UNVERIFIABLE".
- 'truthProof' must be a highly logical, mathematical 2-sentence explanation of how the physical data proves or disproves the claim.
- 'supportingEvidence' must be an array of strings explicitly naming the sensors and data values used.

Output ONLY valid JSON.
{
  "analyzedClaim": "${activeClaim.substring(0, 50)}...",
  "realityScore": 95,
  "verdict": "VERIFIED",
  "truthProof": "NASA FIRMS detected massive thermal anomalies precisely at the coordinates described in the claim. OpenSky API also confirms zero commercial aviation in the sector.",
  "supportingEvidence": ["NASA FIRMS: 154 high-confidence detections", "OpenSky: 0 flights"]
}`;

  try {
    const result = await provider.complete(systemPrompt, "", { maxTokens: 1024, timeout: 60000 });
    const report = parseVeritasResponse(result.text);
    if (report) return report;
    
    console.warn('[Veritas] No valid JSON parsed from LLM response.');
    return null;
  } catch (err) {
    console.error('[Veritas] Fact-check generation crashed:', err.message);
    return null;
  }
}

/**
 * Extracts pure objective physical data from the sweep (ignoring social sentiment other than the initial claim).
 */
function extractPhysicalSensorContext(data) {
  const sensors = [];
  
  // Thermal / Fire
  if (data.thermal?.length) {
    sensors.push(`NASA FIRMS (Thermal/Fires): ` + data.thermal.filter(t => t.det > 0).map(t => `${t.region}: ${t.det} detects`).join(', '));
  } else {
    sensors.push(`NASA FIRMS (Thermal/Fires): 0 anomalies worldwide.`);
  }

  // Aviation
  if (data.air?.length) {
    sensors.push(`OpenSky (Aviation): ` + data.air.map(a => `${a.region} (${a.total} flights)`).join(', '));
  }

  // Radiation
  if (data.nuke?.length) {
    sensors.push(`Safecast/EPA (Radiation): ` + data.nuke.map(n => `${n.site} (${n.cpm}cpm${n.anom ? '⚠️' : ''})`).join(', '));
  }

  // Market
  const vix = data.fred?.find(f => f.id === 'VIXCLS');
  if (vix) sensors.push(`VIX (Fear Index): ${vix.value}`);

  if (sensors.length === 0) return "No physical sensor data available.";
  return sensors.join('\\n');
}

/**
 * Parses the raw LLM output into the Truth Proof object.
 */
function parseVeritasResponse(text) {
  if (!text) return null;
  
  let cleaned = text.trim();
  if (cleaned.startsWith('\`\`\`')) {
    cleaned = cleaned.replace(/^\`\`\`(?:json)?\n?/, '').replace(/\n?\`\`\`$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.realityScore !== 'number') return null;
    return parsed;
  } catch {
    const match = cleaned.match(/\\{[\\s\\S]*\\}/);
    if (match) {
      try {
        const obj = JSON.parse(match[0]);
        if (typeof obj.realityScore === 'number') return obj;
      } catch { return null; }
    }
    return null;
  }
}
