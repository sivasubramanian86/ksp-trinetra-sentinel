"""
Zoho Catalyst Vault / Secret Manager Integration Module (Python)
Equivalent to Google Secret Manager / AWS Secrets Manager
Manages secure retrieval of API Keys, DB URIs, and PII Salt Keys.
"""

import os
import logging

class CatalystSecretManager:
    def __init__(self):
        self._cache = {}

    def get_secret(self, key_name: str, default_value: str = "") -> str:
        """
        Retrieves secret value from Catalyst Environment Variables or process env.
        """
        if key_name in self._cache:
            return self._cache[key_name]

        val = os.environ.get(key_name, default_value)
        self._cache[key_name] = val
        return val

    def get_dpdp_salt(self) -> str:
        return self.get_secret("DPDP_SALT_KEY", "KSP-SENTINEL-DPDP-SALT-2026")

    def get_db_uri(self) -> str:
        return self.get_secret("POSTGRES_DB_URI", "postgresql://ksp_admin:ksp_pass@localhost:5432/trinetra_sentinel")

secret_vault = CatalystSecretManager()
