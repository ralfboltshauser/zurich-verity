# Zurich Verity Submission Manifest

Team: Good Boys  
Product: Zurich Verity  
Challenge: Hyper Challenge 2026, Cyber Track

## Submit These

| Deliverable | Status | Source |
| --- | --- | --- |
| GitHub repository URL | Pending final push | create private repo from this local repository |
| Presentation video | Ready | <https://exploration.nbg1.your-objectstorage.com/zurich-verity_good-boys.mp4> |
| Transcript | Ready | [video/zurich-verity_good-boys-transcript.md](video/zurich-verity_good-boys-transcript.md) |
| Captions, SRT | Ready | [video/zurich-verity_good-boys-transcript.srt](video/zurich-verity_good-boys-transcript.srt) |
| Captions, VTT | Ready | [video/zurich-verity_good-boys-transcript.vtt](video/zurich-verity_good-boys-transcript.vtt) |

## Repository Highlights

| Area | Why it matters | Path |
| --- | --- | --- |
| Main README | Judge-facing overview with screenshots and direct links. | [../README.md](../README.md) |
| Business presentation | Final visual deck used for the submission story. | [presentation/zurich-verity_good-boys.pdf](presentation/zurich-verity_good-boys.pdf) |
| Technical architecture | Technical summary for production fit and system design. | [technical/zurich-verity_good-boys_technical-summary.pdf](technical/zurich-verity_good-boys_technical-summary.pdf) |
| Docker harness | Isolated runner and scope guardrails for active testing. | [../harness/](../harness/) |
| Smithers workflow | Autonomous red-team workflow definition. | [../smithers/](../smithers/) |
| Live PR prototype | Working GitHub PR review integration with Docker proof and PR comments. | [../prototype/live-pr-review/](../prototype/live-pr-review/) |
| Lab reports | Evidence-backed findings, impact, and remediation. | [../reports/](../reports/) |
| Production docs | Architecture, security model, implementation plan, judge brief, and live proof. | [../docs/](../docs/) |

## Proof Points

- 4 services mapped in the Hyper Challenge lab.
- 63 evidence-backed findings documented.
- Critical breach path summarized for business impact and engineering remediation.
- Active testing runs inside Docker with scope guardrails.
- Smithers workflow shown as a PR-triggered, evidence-first validation loop.
- Transcript and captions generated from the final video.

## Final Publish Command

Run this only when ready to publish the final repository:

```bash
gh repo create zurich-verity --private --source . --remote origin --push
```

