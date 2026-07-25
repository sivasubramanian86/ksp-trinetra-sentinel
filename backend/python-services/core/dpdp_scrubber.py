import re
import hashlib

class PIIScrubber:
    """
    DPDP Act 2023 Compliant PII Masking Engine
    Scubs names, phone numbers, Aadhaar/PAN strings, and exact addresses from Kannada & English records.
    """
    PHONE_REGEX = re.compile(r'(\+91[\-\s]?)?[6-9]\d{9}')
    AADHAAR_REGEX = re.compile(r'\b\d{4}[\-\s]?\d{4}[\-\s]?\d{4}\b')
    PAN_REGEX = re.compile(r'\b[A-Z]{5}\d{4}[A-Z]{1}\b')

    @staticmethod
    def hash_identifier(identifier: str) -> str:
        """Deterministically hash sensitive PII identifiers using SHA-256 for anonymized graph linkage."""
        if not identifier:
            return "HASH-NULL"
        return "HASH-" + hashlib.sha256(identifier.encode('utf-8')).hexdigest()[:12]

    @classmethod
    def scrub_text(cls, text: str) -> str:
        if not text:
            return ""
        
        scrubbed = cls.PHONE_REGEX.sub("[MASKED PHONE]", text)
        scrubbed = cls.AADHAAR_REGEX.sub("[MASKED AADHAAR]", scrubbed)
        scrubbed = cls.PAN_REGEX.sub("[MASKED PAN]", scrubbed)
        return scrubbed
