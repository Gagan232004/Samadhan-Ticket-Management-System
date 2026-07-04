# Team Skills Configuration

## SecurityScanningTools
- **Allowed Commands:** 
  - `npm audit` (For checking NodeJS dependencies)
  - `trivy fs .` (For open-source vulnerability scanning)
  - `gitleaks detect --source=. --verbose` (For finding hardcoded secrets)
- **Instructions:**
  Use these tools to gather raw security logs from the local workspace. 
  Parse the terminal outputs, filter out false positives, and compile the final markdown report for the developer.
