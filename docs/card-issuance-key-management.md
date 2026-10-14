# Card Issuance and Key Management Design

## 1. Objective

Define a preliminary design for secure smart-card issuance and key management in the Smart Card Cold Wallet project.

The design covers default-key replacement, per-card key diversification, card registration, and association with the Card Management System (CMS).

## 2. Card Issuance Workflow

1. Identify the card and verify that it is eligible for issuance.
2. Establish an authenticated and protected management session with the card.
3. Replace default management keys before the card is released for use.
4. Provision card-specific key material according to the approved key-management policy.
5. Register the card identifier and issuance status in the CMS.
6. Associate the card with the intended application or account through an authenticated pairing process.
7. Record the issuance result and any relevant audit metadata without storing secret key material in application logs.

## 3. Per-Card Key Diversification

- Each card should use card-specific keys rather than sharing a single operational key across all cards.
- Diversification must follow an approved cryptographic scheme and use a unique, stable card identifier.
- Master keys must remain in an appropriately protected key-management environment.
- Secret keys must not be embedded in source code, committed to Git, or exposed in logs.
- The selected diversification algorithm, input format, key versions, and rotation policy require implementation-level review.

## 4. CMS Card Registry

The CMS registry should track, at minimum:

- Card identifier
- Issuance status
- Key version or key-set reference, without exposing secret keys
- Pairing status
- Creation and update timestamps
- Relevant audit events

Access to issuance and key-management operations should be authenticated and restricted by role.

## 5. Failure Handling

- If secure-session establishment fails, stop the issuance process.
- If default-key replacement or key provisioning fails, do not mark the card as ready for use.
- If CMS registration fails, record the failure and reconcile the card state before retrying.
- Prevent duplicate issuance and pairing operations from silently creating inconsistent records.
- Do not log PINs, master keys, diversified secret keys, or session keys.

## 6. Verification Plan

- Verify that unauthenticated management commands are rejected.
- Verify that default keys are replaced successfully before issuance completes.
- Verify that different cards receive the intended card-specific key material.
- Verify that failed issuance operations do not incorrectly mark a card as ready.
- Verify that CMS registration and pairing states remain consistent.
- Record test procedures, expected results, actual results, and evidence.

## 7. Verification Status

- Design documented: pending review.
- Key-diversification implementation: pending verification.
- CMS issuance workflow: pending verification.
- Security tests: pending execution.

This document describes a proposed design and verification plan. It does not claim that implementation or security testing has been completed.