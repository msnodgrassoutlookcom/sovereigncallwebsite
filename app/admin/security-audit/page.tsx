"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SecurityAuditReport } from "@/components/security-audit-report"
import {
  checkXSSVulnerabilities,
  checkSQLInjectionVulnerabilities,
  checkInsecurePasswordStorage,
  checkMissingCSRFProtection,
  checkInsecureSessionManagement,
  checkLackOfRateLimiting,
  checkMissingHTTPS,
  checkMissingDataRetentionPolicy,
} from "@/lib/security-audit"

export default function SecurityAuditPage() {
  const [findings, setFindings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const runAudit = async () => {
    setLoading(true)
    try {
      // Run all audit checks in parallel
      const [
        xssFindings,
        sqlInjectionFindings,
        insecurePasswordFindings,
        missingCSRFFindings,
        insecureSessionFindings,
        lackOfRateLimitingFindings,
        missingHTTPSFindings,
        missingDataRetentionPolicyFindings,
      ] = await Promise.all([
        checkXSSVulnerabilities(),
        checkSQLInjectionVulnerabilities(),
        checkInsecurePasswordStorage(),
        checkMissingCSRFProtection(),
        checkInsecureSessionManagement(),
        checkLackOfRateLimiting(),
        checkMissingHTTPS(),
        checkMissingDataRetentionPolicy(),
      ])

      // Combine all findings into a single array
      const allFindings = [
        ...xssFindings,
        ...sqlInjectionFindings,
        ...insecurePasswordFindings,
        ...missingCSRFFindings,
        ...insecureSessionFindings,
        ...lackOfRateLimitingFindings,
        ...missingHTTPSFindings,
        ...missingDataRetentionPolicyFindings,
      ]

      setFindings(allFindings)
    } catch (error) {
      console.error("Error running security audit:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runAudit()
  }, [])

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Security Audit</h1>
        <Button onClick={runAudit} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Running Audit..." : "Run Audit Again"}
        </Button>
      </div>

      <SecurityAuditReport findings={findings} />

      <div className="mt-8">
        <Link href="/admin/diagnostics">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Diagnostics
          </Button>
        </Link>
      </div>
    </div>
  )
}
