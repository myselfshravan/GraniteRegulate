
import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload as UploadIcon, FileText, Music, AlertCircle, CheckCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'analyzing' | 'complete' | 'error';
  progress: number;
  violations: string[];
  error?: string;
}

const Upload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (fileList: File[]) => {
    const validTypes = ['text/csv', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'text/plain'];
    
    fileList.forEach(file => {
      if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload CSV or audio files.`,
          variant: "destructive",
        });
        return;
      }

      const newFile: UploadedFile = {
        id: Math.random().toString(36),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        progress: 0,
        violations: [],
      };

      setFiles(prev => [...prev, newFile]);
      
      // Start the actual analysis
      startAnalysis(file, newFile.id);
    });
  };

  const startAnalysis = async (file: File, fileId: string) => {
    // 1. Set status to analyzing
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'analyzing' as const, progress: 10 } : f
    ));

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 2. Make the API call
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 50 } : f
      ));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const results = await response.json();

      // 3. Update file with results
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'complete' as const, 
          progress: 100,
          violations: results.violations 
        } : f
      ));

      toast({
        title: "Analysis complete",
        description: `Found ${results.violations.length} potential violations in ${results.filename}.`,
        variant: results.violations.length > 0 ? "destructive" : "default",
      });

    } catch (error: any) {
      // 4. Handle errors
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'error' as const, 
          progress: 100,
          error: error.message 
        } : f
      ));

      toast({
        title: "An error occurred",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const viewResults = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      navigate(`/violations/${fileId}`, { state: { violations: file.violations, fileName: file.name } });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, name: string) => {
    if (type.includes('audio') || name.endsWith('.wav') || name.endsWith('.mp3')) {
      return <Music className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-green-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload Data</h1>
        <p className="text-muted-foreground mt-2">
          Upload CSV files or meeting recordings for GDPR and HIPAA compliance analysis
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>
            Drag and drop files here or click to select. Supported formats: CSV, WAV, MP3, TXT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200
              ${isDragging 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragging ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            <p className="text-muted-foreground mb-4">
              or click to browse your computer
            </p>
            <input
              type="file"
              multiple
              accept=".csv,.wav,.mp3,.txt,audio/*,text/csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Select Files
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Queue</CardTitle>
            <CardDescription>
              Files are being analyzed for compliance violations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  {getFileIcon(file.type, file.name)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <Badge variant={
                        file.status === 'complete' ? 'default' :
                        file.status === 'analyzing' ? 'secondary' :
                        file.status === 'error' ? 'destructive' : 'outline'
                      }>
                        {file.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {file.status === 'analyzing' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Analyzing...</span>
                          <span>{file.progress}%</span>
                        </div>
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    )}
                    
                    {file.status === 'complete' && (
                      <div className="flex items-center gap-2">
                        {file.violations.length > 0 ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm text-destructive">
                              {file.violations.length} violations found
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">
                              No violations detected
                            </span>
                          </>
                        )}
                      </div>
                    )}
                     {file.status === 'error' && file.error && (
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm text-destructive">
                                Error: {file.error}
                            </span>
                        </div>
                     )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.status === 'complete' && file.violations.length > 0 && (
                      <Button 
                        size="sm" 
                        onClick={() => viewResults(file.id)}
                      >
                        View Results
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {files.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No files uploaded yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by uploading your first file to begin compliance analysis
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• CSV files for structured data analysis</p>
                <p>• Audio files for meeting recording analysis</p>
                <p>• Text files for document content review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Upload;
