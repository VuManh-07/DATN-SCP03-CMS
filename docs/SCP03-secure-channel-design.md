# SCP03 Secure Channel Design

## 1. Objective

Define the secure communication design between the host application and the smart card using Secure Channel Protocol 03 (SCP03).

This document covers channel establishment, mutual authentication, secure messaging, session handling, and security verification.

## 2. Secure Channel Establishment

1. The host initiates SCP03 channel establishment with the target card application.
2. The host and card exchange the protocol data required to establish the secure channel.
3. Both sides derive the required session keys according to the selected SCP03 implementation.
4. The host verifies the card cryptogram.
5. The card verifies the host cryptogram during external authentication.
6. The required secure messaging security level is established.
7. Protected communication proceeds only after the applicable authentication checks succeed.

Exact command parameters and security levels must be verified against the selected card applet and SCP03 implementation.

## 3. Security Requirements

- Do not expose static keys, session keys, or sensitive authentication data in logs.
- Reject failed authentication.
- Verify message authentication codes for protected messages.
- Handle session state and cryptographic counters according to the SCP03 implementation.
- Do not silently reuse an invalid or failed session.
- Manage per-card keys according to the agreed key diversification design.

## 4. Security Test Cases

| Test case | Expected behavior |
|---|---|
| Invalid card cryptogram | Reject channel establishment |
| Invalid host cryptogram | Reject authentication |
| Incorrect MAC | Reject the protected message |
| Unexpected command sequence | Reject or handle according to protocol rules |
| Failed channel establishment | Do not use the failed session |
| Invalid or expired session | Require a valid session before protected communication |
| Incorrect security level | Reject or prevent operations that do not meet the required security level |

## 5. Verification Status

- Design documented: pending review.
- Implementation reviewed: pending.
- SCP03 test vectors verified: pending.
- Smart-card integration tested: pending.

This document records the intended design and test plan. It does not claim that implementation or hardware integration has passed testing.