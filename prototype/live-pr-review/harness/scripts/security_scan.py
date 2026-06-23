#!/usr/bin/env python3
import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path


SENSITIVE_KEY_RE = re.compile(
    r"(password|passwd|pwd|api[_-]?key|secret|token|ssn|social[_-]?security|credit[_-]?card|private[_-]?key|session)",
    re.IGNORECASE,
)
ROUTE_RE = re.compile(r"self\.path\s*(?:==|\.startswith\()\s*[\"']([^\"']+)[\"']")
STATIC_SECRET_RE = re.compile(
    r"(?i)(password|api[_-]?key|secret|token)\s*[:=]\s*[\"'](?!placeholder|redacted|example|demo|test|dummy)([^\"']{8,})[\"']"
)
DANGEROUS_STATIC_PATTERNS = [
    ("command-injection", re.compile(r"subprocess\.[a-z_]+\([^\\n]*shell\s*=\s*True", re.IGNORECASE)),
    ("path-traversal", re.compile(r"open\([^\\n]*(self\.path|parse_qs|query|filename|path)", re.IGNORECASE)),
    ("ssrf", re.compile(r"(urllib\.request|requests\.get|requests\.post|urlopen)\([^\\n]*(url|target|uri|self\.path|parse_qs)", re.IGNORECASE)),
]


def read_app() -> str:
    return Path("demo_app/app.py").read_text(encoding="utf-8")


def routes(source: str) -> list[str]:
    seen = []
    for route in ROUTE_RE.findall(source):
        if route not in seen:
            seen.append(route)
    return seen


def route_lines(source: str) -> dict[str, int]:
    result = {}
    for idx, line in enumerate(source.splitlines(), start=1):
        match = ROUTE_RE.search(line)
        if match:
            result.setdefault(match.group(1), idx)
    return result


def get(path: str) -> tuple[int, str]:
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:8080{path}", timeout=2) as response:
            return response.getcode(), response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode("utf-8", errors="replace")
    except Exception as error:
        return 0, str(error)


def sensitive_json_paths(value, prefix="$") -> list[str]:
    hits = []
    if isinstance(value, dict):
        for key, child in value.items():
            child_prefix = f"{prefix}.{key}"
            if SENSITIVE_KEY_RE.search(str(key)):
                hits.append(child_prefix)
            hits.extend(sensitive_json_paths(child, child_prefix))
    elif isinstance(value, list):
        for idx, child in enumerate(value):
            hits.extend(sensitive_json_paths(child, f"{prefix}[{idx}]"))
    return hits


def scan_static(source: str) -> list[dict]:
    findings = []

    for match in STATIC_SECRET_RE.finditer(source):
        line = source[: match.start()].count("\n") + 1
        findings.append(
            {
                "id": "hardcoded-secret",
                "severity": "blocking",
                "title": "Hardcoded secret-like value committed to application code",
                "file": "demo_app/app.py",
                "line": line,
                "evidence": f"Matched secret-like assignment for `{match.group(1)}`.",
                "proof": f"static grep at demo_app/app.py:{line}",
                "businessImpact": "A committed credential can be reused outside the demo service and creates incident response, rotation, and customer trust risk.",
                "recommendation": "Remove the secret from source control and load it from a managed secret store or environment variable.",
            }
        )

    for category, pattern in DANGEROUS_STATIC_PATTERNS:
        for match in pattern.finditer(source):
            line = source[: match.start()].count("\n") + 1
            findings.append(
                {
                    "id": category,
                    "severity": "blocking",
                    "title": f"Potential {category.replace('-', ' ')} introduced in request handling",
                    "file": "demo_app/app.py",
                    "line": line,
                    "evidence": "Static analysis found user-controlled request data flowing into a dangerous sink.",
                    "proof": f"static grep at demo_app/app.py:{line}",
                    "businessImpact": "A network caller may be able to pivot from the public API into internal systems or the host runtime.",
                    "recommendation": "Remove the dangerous sink or add strict allowlists, canonicalization, and server-side authorization before use.",
                }
            )

    return findings


def scan_dynamic(source: str) -> list[dict]:
    findings = []
    line_by_route = route_lines(source)

    for route in routes(source):
        if route in {"/health", "/api/users"}:
            continue
        if "{" in route or route.endswith("/"):
            continue

        status, body = get(route)
        if status != 200:
            continue

        sensitive_paths = []
        try:
            sensitive_paths = sensitive_json_paths(json.loads(body))
        except json.JSONDecodeError:
            if SENSITIVE_KEY_RE.search(body):
                sensitive_paths = ["response-body"]

        if not sensitive_paths:
            continue

        evidence_path = f".verity/evidence{route.replace('/', '_') or '_root'}.txt"
        Path(evidence_path).parent.mkdir(parents=True, exist_ok=True)
        Path(evidence_path).write_text(body[:10000], encoding="utf-8")
        findings.append(
            {
                "id": "unauthenticated-sensitive-data-exposure",
                "severity": "blocking",
                "title": "Unauthenticated endpoint exposes sensitive data",
                "file": "demo_app/app.py",
                "line": line_by_route.get(route),
                "route": route,
                "evidence": f"HTTP 200 response contained sensitive fields: {', '.join(sensitive_paths[:8])}.",
                "proof": f"curl http://127.0.0.1:8080{route}",
                "evidencePath": evidence_path,
                "businessImpact": "An unauthenticated caller can retrieve sensitive customer or operational data. In a real Zurich service this maps to privacy, regulatory, and incident-response risk.",
                "recommendation": "Remove the endpoint or enforce server-side authorization and never serialize sensitive fields.",
            }
        )

    return findings


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--routes-only", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    source = read_app()

    if args.routes_only:
        for route in routes(source):
            print(route)
        return 0

    findings = scan_static(source) + scan_dynamic(source)
    result = {"finding": bool(findings), "findings": findings, "routes": routes(source)}

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        for finding in findings:
            print(f"[{finding['severity']}] {finding['title']} ({finding.get('file')}:{finding.get('line')})")

    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
