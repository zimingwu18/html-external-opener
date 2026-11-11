# Security Policy

## Reporting a vulnerability

Please do not report security vulnerabilities in public issues. Contact the maintainer through the GitHub profile at https://github.com/zimingwu18 and include:

- A concise description of the issue.
- Steps to reproduce or a proof of concept.
- The affected plugin version and Obsidian version.

Please allow reasonable time for investigation and a fix before public disclosure.

## Security design notes

- Only Vault-resolved local HTML files are eligible for automatic opening.
- Resolved paths are checked against the real Vault root; symlinks escaping the Vault are rejected.
- Configured browser executables are launched with `shell: false` and are never derived from a Markdown link.
- No network requests or telemetry are implemented.
