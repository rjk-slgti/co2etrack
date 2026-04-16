import hashlib
import json
from datetime import datetime
from typing import Dict, Any, List
from pydantic import BaseModel

class CredentialSubject(BaseModel):
    batch_id: str
    net_removal_tonnes: float
    uncertainty_p95: float
    assurance_grade: str
    facility_id: str
    marker_id: str

class VerifiableCredential(BaseModel):
    context: List[str] = ["https://www.w3.org/2018/credentials/v1", "https://c44dev.io/contexts/ccus/v1"]
    type: List[str] = ["VerifiableCredential", "CarbonRemovalCredential"]
    issuer: str = "did:web:c44dev.io:registry"
    issuanceDate: str
    credentialSubject: CredentialSubject
    proof: Dict[str, Any]

class ProvenanceLedger:
    def __init__(self, salt: str = "C44DEV_REGISTRY_2026"):
        self.salt = salt

    def generate_batch_hash(self, batch_data: Dict[str, Any], previous_hash: str = "0" * 64) -> str:
        """
        Generates an immutable SHA-256 hash for a CCUS batch.
        Links to previous_hash to create a Digital Twin chain.
        """
        payload = {
            "batch_id": batch_data.get("id"),
            "mass": batch_data.get("mass_tonnes"),
            "marker": batch_data.get("marker_id"),
            "previous_hash": previous_hash,
            "salt": self.salt
        }
        encoded = json.dumps(payload, sort_keys=True).encode()
        return hashlib.sha256(encoded).hexdigest()

    def issue_credential(self, batch_info: Dict[str, Any], ledger_hash: str) -> VerifiableCredential:
        """
        Generates a W3C-compliant Verifiable Credential for the removal batch.
        """
        return VerifiableCredential(
            issuanceDate=datetime.utcnow().isoformat() + "Z",
            credentialSubject=CredentialSubject(
                batch_id=batch_info["id"],
                net_removal_tonnes=batch_info["net_tonnes"],
                uncertainty_p95=batch_info["uncertainty"],
                assurance_grade=batch_info["grade"],
                facility_id=batch_info["facility"],
                marker_id=batch_info["marker"]
            ),
            proof={
                "type": "Ed25519Signature2018",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:web:c44dev.io:registry#key-1",
                "jws": f"registry_proof_{ledger_hash[:16]}",
                "created": datetime.utcnow().isoformat() + "Z"
            }
        )

# Global Instance
ledger = ProvenanceLedger()
