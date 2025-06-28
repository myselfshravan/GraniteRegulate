
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Download, Eye, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Report {
  id: string;
  fileName: string;
  generatedDate: Date;
  fileType: string;
  violationsFound: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'completed' | 'processing' | 'failed';
  analysisType: 'GDPR' | 'HIPAA' | 'Both';
}

const Reports = () => {
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  // Mock reports data
  const reports: Report[] = [
    {
      id: "1",
      fileName: "customer_database_export.csv",
      generatedDate: new Date("2024-01-15"),
      fileType: "CSV",
      violationsFound: 23,
      severity: "Critical",
      status: "completed",
      analysisType: "GDPR"
    },
    {
      id: "2",
      fileName: "meeting_recording_jan_12.wav", 
      generatedDate: new Date("2024-01-14"),
      fileType: "Audio",
      violationsFound: 8,
      severity: "High",
      status: "completed",
      analysisType: "HIPAA"
    },
    {
      id: "3",
      fileName: "employee_records_2024.csv",
      generatedDate: new Date("2024-01-13"),
      fileType: "CSV", 
      violationsFound: 12,
      severity: "Medium",
      status: "completed",
      analysisType: "Both"
    },
    {
      id: "4",
      fileName: "sales_call_transcript.txt",
      generatedDate: new Date("2024-01-12"),
      fileType: "Text",
      violationsFound: 0,
      severity: "Low",
      status: "completed",
      analysisType: "GDPR"
    },
    {
      id: "5",
      fileName: "patient_data_backup.csv",
      generatedDate: new Date("2024-01-11"),
      fileType: "CSV",
      violationsFound: 45,
      severity: "Critical",
      status: "processing",
      analysisType: "HIPAA"
    }
  ];

  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || report.severity.toLowerCase() === severityFilter;
    
    let matchesDateRange = true;
    if (dateFrom && dateTo) {
      matchesDateRange = report.generatedDate >= dateFrom && report.generatedDate <= dateTo;
    }
    
    return matchesStatus && matchesSeverity && matchesDateRange;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const viewReport = (reportId: string) => {
    navigate(`/violations/${reportId}`);
  };

  const downloadReport = (reportId: string, fileName: string) => {
    // Simulate PDF download
    const element = document.createElement('a');
    const file = new Blob(['Report Content'], { type: 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = `${fileName.replace(/\.[^/.]+$/, "")}-report.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance Reports</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all compliance analysis reports
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export All Reports
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-sm text-muted-foreground">Total Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {reports.filter(r => r.severity === 'Critical').length}
            </div>
            <p className="text-sm text-muted-foreground">Critical Issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {reports.reduce((sum, r) => sum + r.violationsFound, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Violations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {reports.filter(r => r.status === 'completed').length}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Severity</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="grid gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{report.fileName}</h3>
                    <Badge variant={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    <Badge variant={getSeverityColor(report.severity)}>
                      {report.severity}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Generated:</span>
                      <div>{format(report.generatedDate, "PPP")}</div>
                    </div>
                    <div>
                      <span className="font-medium">File Type:</span>
                      <div>{report.fileType}</div>
                    </div>
                    <div>
                      <span className="font-medium">Violations:</span>
                      <div className={report.violationsFound > 0 ? "text-destructive font-medium" : "text-green-600"}>
                        {report.violationsFound} found
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Analysis:</span>
                      <div>{report.analysisType}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {report.status === 'completed' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewReport(report.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => downloadReport(report.id, report.fileName)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </>
                  )}
                  {report.status === 'processing' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      Processing...
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports found</h3>
              <p className="text-muted-foreground mb-6">
                No reports match your current filter criteria
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setStatusFilter("all");
                  setSeverityFilter("all");
                  setDateFrom(undefined);
                  setDateTo(undefined);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
