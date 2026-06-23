# Autonomous Red-Team Workflow

## Objective

Find, prove, prioritize, and retest security risks in a scoped application or lab environment.

## Stages

1. **Scope intake**
   - Read the objective, target assets, allowed hostnames, prohibited actions, and evidence requirements.
   - Refuse or pause if scope is ambiguous.

2. **Asset inventory**
   - Enumerate services, routes, API specs, repositories, public files, and authentication flows.
   - Record positive and negative coverage.

3. **Hypothesis generation**
   - Generate attack hypotheses from observed assets and source evidence.
   - Prioritize paths that can create business impact, not only technical novelty.

4. **Docker-only validation**
   - Execute active tests from the harness runner.
   - Capture request, response, command, timestamp, and artifact path.

5. **Finding confirmation**
   - Promote only reproducible evidence to confirmed findings.
   - Separate confirmed issues from hypotheses and dead ends.

6. **Risk scoring**
   - Score likelihood, exploitability, impact, affected asset, and business consequence.
   - Identify breach paths that chain multiple findings.

7. **Report generation**
   - Write developer-facing findings with reproduction and remediation.
   - Write executive summaries with business risk and priority.

8. **Retest**
   - Generate retest commands.
   - Verify fixes and record whether the breach path is broken.

## Outputs

- Evidence pack.
- Markdown report.
- JSON finding index.
- GitHub comments or issues.
- Leadership risk summary.
