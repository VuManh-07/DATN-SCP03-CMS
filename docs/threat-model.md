# Threat Model — Smart Card Cold Wallet

## 1. Objective

Identify the main security threats affecting the smart-card cold wallet, secure communication channel, card management system (CMS), and host application.

## 2. Assets to Protect

- Private keys stored on the smart card.
- Card PIN and authentication credentials.
- SCP03 session keys and secure-channel state.
- Per-card keys used for card authentication and secure communication.
- Card identity and application-pairing information.
- CMS user accounts, API credentials, and card-management records.
- Transaction data exchanged between the host application and smart card.

## 3. Trust Boundaries

- Host application ↔ smart card.
- Host application ↔ CMS backend API.
- CMS backend ↔ database.
- Card issuance and key-provisioning process.
- Administrative users ↔ CMS management interface.

## 4. Threats and Proposed Mitigations

| Threat | Potential impact | Proposed mitigation |
|---|---|---|
| Unauthorized card access | Unauthorized wallet operations | PIN verification, authentication, and retry limits |
| Interception of card communication | Exposure or manipulation of sensitive messages | SCP03 secure messaging with encryption and MAC |
| Message replay | Reuse of previously captured commands | Secure-channel sequence counter and protocol-state validation |
| Failed mutual authentication | Communication with an untrusted card or host | Verify authentication cryptograms before accepting the session |
| Key exposure during card issuance | Compromise of card communication | Secure key provisioning, restricted access, and per-card key diversification |
| Unauthorized card pairing | A card is linked to the wrong application or account | Authenticated pairing and server-side authorization |
| Unauthorized CMS API access | Modification or disclosure of card records | Authentication, authorization, input validation, and audit logging |
| Database compromise | Exposure of sensitive card-management data | Least-privilege database access and protection of sensitive fields |
| Physical attack against the card | Possible extraction or misuse of sensitive information | Platform-supported protections and security testing |

## 5. Security Assumptions

- The smart card supports the required SCP03 functions.
- Cryptographic keys are provisioned through a controlled process.
- The CMS backend and database can enforce access controls.
- Security guarantees depend on correct implementation and configuration.

These assumptions must be verified during implementation and integration.

## 6. Verification Plan

- Test rejection of invalid mutual-authentication cryptograms.
- Test rejection of invalid MACs and malformed secure messages.
- Test sequence-counter and replay-protection behavior.
- Test unauthorized card-pairing attempts.
- Test CMS authentication and authorization failures.
- Review key provisioning and per-card key diversification.
- Record test procedures, expected results, actual results, and evidence.

## 7. Verification Status

- Threats identified: preliminary design.
- Mitigations reviewed: pending.
- Security tests executed: pending.
- Smart-card and CMS integration verified: pending.

This document describes a preliminary threat model. It does not claim that the proposed mitigations have been implemented or that security testing has passed.