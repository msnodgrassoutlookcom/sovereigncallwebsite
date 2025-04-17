import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuditReportProps {
  findings: {
    title: string
    description: string
    severity: string
    recommendations: string[]
  }[]
}

export function SecurityAuditReport({ findings }: AuditReportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Audit Report</CardTitle>
        <CardDescription>Findings and recommendations from the security audit</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {findings.map((finding, index) => (
          <div key={index} className="border rounded-md p-4">
            <h3 className="text-lg font-semibold">{finding.title}</h3>
            <p className="text-sm text-muted-foreground">{finding.description}</p>
            <div className="mt-2">
              <h4 className="text-sm font-medium">Recommendations:</h4>
              <ul className="list-disc pl-5">
                {finding.recommendations.map((recommendation, i) => (
                  <li key={i} className="text-sm">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
