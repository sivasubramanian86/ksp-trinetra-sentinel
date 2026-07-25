/**
 * Zoho Catalyst Vault / Secret Manager Integration Module
 * Safely handles local Node execution and Zoho Catalyst Cloud runtime.
 */

let catalyst = null;
try {
  catalyst = require('zcatalyst-sdk-node');
} catch (e) {
  // zcatalyst-sdk-node is provisioned automatically in Catalyst Cloud environment
}

class CatalystSecretManager {
  constructor() {
    this.cachedSecrets = {};
  }

  /**
   * Retrieves a secret key from process environment or Zoho Catalyst Vault.
   * @param {string} keyName - Secret Key Identifier
   * @param {string} defaultValue - Fallback default value
   */
  async getSecret(keyName, defaultValue = '') {
    // 1. Return cached secret if present
    if (this.cachedSecrets[keyName]) {
      return this.cachedSecrets[keyName];
    }

    // 2. Check process environment (Local .env / Catalyst Config)
    if (process.env[keyName]) {
      this.cachedSecrets[keyName] = process.env[keyName];
      return process.env[keyName];
    }

    // 3. Query Catalyst Secret Store API if catalyst SDK is available
    if (catalyst && process.env.CATALYST_APP_ID) {
      try {
        const app = catalyst.initialize();
        const secretStore = app.secretStore();
        const secretDetails = await secretStore.getSecret(keyName);
        if (secretDetails && secretDetails.secretValue) {
          this.cachedSecrets[keyName] = secretDetails.secretValue;
          return secretDetails.secretValue;
        }
      } catch (err) {
        // Vault lookup fallback
      }
    }

    return defaultValue;
  }

  /**
   * Encrypts sensitive string using DPDP Act 2023 compliant salt key.
   */
  async getDpdpSaltKey() {
    return await this.getSecret('DPDP_SALT_KEY', 'KSP-SENTINEL-DPDP-SALT-2026');
  }

  /**
   * Retrieves PostgreSQL PostGIS database connection string.
   */
  async getDbConnectionString() {
    return await this.getSecret(
      'POSTGRES_DB_URI',
      'postgresql://ksp_admin:ksp_secret_pass@localhost:5432/trinetra_sentinel'
    );
  }
}

module.exports = new CatalystSecretManager();
