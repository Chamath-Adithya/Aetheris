// The Antigravity Executor: Webhook trigger module
// Translates LLM-generated evasive actions into raw API triggers for external systems.

import { safeFetch } from '../../apis/utils/fetch.mjs';

export class WebhookExecutor {
  constructor(config = {}) {
    this.enabled = config.enabled || false;
    this.endpoints = config.endpoints || [];
    this.isConfigured = this.enabled && this.endpoints.length > 0;
  }

  /**
   * Dispatches the Gravity Report and evasive actions to external endpoints
   * @param {object} gravityReport - Full { gravityScore, criticalSectors, evasiveActions }
   */
  async executeActions(gravityReport) {
    if (!this.isConfigured) return;
    if (!gravityReport || !gravityReport.evasiveActions || gravityReport.evasiveActions.length === 0) {
      return; // No actions to execute
    }

    console.log(`[Antigravity] Executing ${gravityReport.evasiveActions.length} webhook triggers...`);

    const payload = {
      timestamp: new Date().toISOString(),
      agent: "Veritas Truth Engine",
      gravityScore: gravityReport.gravityScore,
      rationale: gravityReport.rationale,
      actions: gravityReport.evasiveActions,
      sectors: gravityReport.criticalSectors
    };

    const promises = this.endpoints.map(async (url) => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        console.log(`[Antigravity] Webhook trigger successful -> ${url}`);
      } catch (err) {
        console.error(`[Antigravity] Webhook trigger FAILED for ${url}:`, err.message);
      }
    });

    await Promise.allSettled(promises);
  }
}
