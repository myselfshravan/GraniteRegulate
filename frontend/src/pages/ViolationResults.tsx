import { useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Search, Filter, AlertTriangle, Info, AlertCircle } from "lucide-react";

interface Violation {
  id: string;
  dataSnippet: string;
  violationType: 'PII' | 'PHI';
  rule: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  context: string;
  lineNumber?: number;
  timestamp?: string;
}

const ViolationResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { violations: rawViolations = [], fileName = "Unknown File" } = location.state || {};

  const transformedViolations: Violation[] = useMemo(() => {
    if (!rawViolations) return [];
    return rawViolations.map((v: string, index: number) => {
      const isGdpr = v.toLowerCase().includes('gdpr');
      const isPhi = v.toLowerCase().includes('phi');
      
      let violationType: 'PII' | 'PHI' = 'PII';
      if (isPhi) violationType = 'PHI';

      const severityLevels: Array<'Low' | 'Medium' | 'High' | 'Critical'> = ['Low', 'Medium', 'High', 'Critical'];
      const severity = severityLevels[Math.floor(Math.random() * 4)];

      const match = v.match(/row (\d+), column '([^']+)'/);
      const lineNumber = match ? parseInt(match[1], 10) : undefined;
      const context = match ? `In column: ${match[2]}` : 'File-level violation';

      return {
        id: `${id}-${index}`,
        dataSnippet: v,
        violationType,
        rule: isGdpr ? "GDPR" : "HIPAA",
        severity,
        context,
        lineNumber,
      };
    });
  }, [rawViolations, id]);

  const filteredViolations = transformedViolations.filter(violation => {
    const matchesSearch = violation.dataSnippet.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         violation.rule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === "all" || violation.severity.toLowerCase() === severityFilter;
    const matchesType = typeFilter === "all" || violation.violationType.toLowerCase() === typeFilter;
    
    return matchesSearch && matchesSeverity && matchesType;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const downloadReport = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rawViolations),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `violation-report-${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Failed to download report:", error);
      // You could add a toast notification here to inform the user
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/upload')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Upload
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Violation Results</h1>
            <p className="text-muted-foreground mt-2">
              Analysis results for: <span className="font-semibold text-foreground">{fileName}</span>
            </p>
          </div>
        </div>
        <Button onClick={downloadReport}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{filteredViolations.length}</div>
            <p className="text-sm text-muted-foreground">Total Violations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">
              {filteredViolations.filter(v => v.severity === 'Critical').length}
            </div>
            <p className="text-sm text-muted-foreground">Critical Issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {filteredViolations.filter(v => v.violationType === 'PII').length}
            </div>
            <p className="text-sm text-muted-foreground">PII Violations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-500">
              {filteredViolations.filter(v => v.violationType === 'PHI').length}
            </div>
            <p className="text-sm text-muted-foreground">PHI Violations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search violations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pii">PII</SelectItem>
                <SelectItem value="phi">PHI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Violations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Violations</CardTitle>
          <CardDescription>
            Click on a row to view detailed context and remediation suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Snippet</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Rule</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredViolations.map((violation) => (
                  <TableRow 
                    key={violation.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      // Navigate to detailed view (could be implemented)
                      console.log("View details for violation:", violation.id);
                    }}
                  >
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={violation.dataSnippet}>
                        {violation.dataSnippet}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {violation.context}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={violation.violationType === 'PII' ? 'default' : 'secondary'}>
                        {violation.violationType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {violation.rule}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(violation.severity)}
                        <Badge variant={getSeverityColor(violation.severity)}>
                          {violation.severity}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {violation.lineNumber && `Line ${violation.lineNumber}`}
                      {violation.timestamp && `Time ${violation.timestamp}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredViolations.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No violations found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViolationResults;
