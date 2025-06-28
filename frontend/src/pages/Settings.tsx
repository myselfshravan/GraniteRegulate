
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Bell, 
  Database, 
  Users, 
  Settings as SettingsIcon,
  Save,
  AlertTriangle
} from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      slack: false,
      sms: false,
      criticalOnly: true,
    },
    analysis: {
      autoAnalysis: true,
      retentionDays: 90,
      confidenceThreshold: 0.8,
      includeContext: true,
    },
    compliance: {
      gdprEnabled: true,
      hipaaEnabled: true,
      customRules: false,
      auditLogging: true,
    },
    security: {
      twoFactor: false,
      sessionTimeout: 60,
      ipWhitelist: false,
      dataEncryption: true,
    }
  });

  const handleSave = () => {
    // Simulate saving settings
    toast({
      title: "Settings saved",
      description: "Your compliance settings have been updated successfully.",
    });
  };

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure compliance monitoring and system preferences
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you receive alerts about compliance violations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.notifications.email}
                onCheckedChange={(checked) => 
                  handleSettingChange('notifications', 'email', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="slack-notifications">Slack Integration</Label>
                <p className="text-sm text-muted-foreground">Send alerts to Slack channels</p>
              </div>
              <Switch
                id="slack-notifications"
                checked={settings.notifications.slack}
                onCheckedChange={(checked) => 
                  handleSettingChange('notifications', 'slack', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notifications">SMS Alerts</Label>
                <p className="text-sm text-muted-foreground">Critical alerts via SMS</p>
              </div>
              <Switch
                id="sms-notifications"
                checked={settings.notifications.sms}
                onCheckedChange={(checked) => 
                  handleSettingChange('notifications', 'sms', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="critical-only">Critical Only</Label>
                <p className="text-sm text-muted-foreground">Only notify for critical violations</p>
              </div>
              <Switch
                id="critical-only"
                checked={settings.notifications.criticalOnly}
                onCheckedChange={(checked) => 
                  handleSettingChange('notifications', 'criticalOnly', checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Analysis Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Analysis Configuration
            </CardTitle>
            <CardDescription>
              Customize how files are analyzed for violations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-analysis">Automatic Analysis</Label>
                <p className="text-sm text-muted-foreground">Analyze files immediately on upload</p>
              </div>
              <Switch
                id="auto-analysis"
                checked={settings.analysis.autoAnalysis}
                onCheckedChange={(checked) => 
                  handleSettingChange('analysis', 'autoAnalysis', checked)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention">Data Retention (Days)</Label>
              <Input
                id="retention"
                type="number"
                value={settings.analysis.retentionDays}
                onChange={(e) => 
                  handleSettingChange('analysis', 'retentionDays', parseInt(e.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence">Confidence Threshold</Label>
              <Select 
                value={settings.analysis.confidenceThreshold.toString()}
                onValueChange={(value) => 
                  handleSettingChange('analysis', 'confidenceThreshold', parseFloat(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.6">60% - Low (More alerts)</SelectItem>
                  <SelectItem value="0.8">80% - Medium (Balanced)</SelectItem>
                  <SelectItem value="0.9">90% - High (Fewer alerts)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="include-context">Include Context</Label>
                <p className="text-sm text-muted-foreground">Show surrounding data for violations</p>
              </div>
              <Switch
                id="include-context"
                checked={settings.analysis.includeContext}
                onCheckedChange={(checked) => 
                  handleSettingChange('analysis', 'includeContext', checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Compliance Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Rules
            </CardTitle>
            <CardDescription>
              Enable or disable specific compliance frameworks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="gdpr">GDPR Compliance</Label>
                <Badge variant="default">EU</Badge>
              </div>
              <Switch
                id="gdpr"
                checked={settings.compliance.gdprEnabled}
                onCheckedChange={(checked) => 
                  handleSettingChange('compliance', 'gdprEnabled', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="hipaa">HIPAA Compliance</Label>
                <Badge variant="secondary">US Healthcare</Badge>
              </div>
              <Switch
                id="hipaa"
                checked={settings.compliance.hipaaEnabled}
                onCheckedChange={(checked) => 
                  handleSettingChange('compliance', 'hipaaEnabled', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="custom-rules">Custom Rules</Label>
                <p className="text-sm text-muted-foreground">Enable organization-specific rules</p>
              </div>
              <Switch
                id="custom-rules"
                checked={settings.compliance.customRules}
                onCheckedChange={(checked) => 
                  handleSettingChange('compliance', 'customRules', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="audit-logging">Audit Logging</Label>
                <p className="text-sm text-muted-foreground">Track all compliance activities</p>
              </div>
              <Switch
                id="audit-logging"
                checked={settings.compliance.auditLogging}
                onCheckedChange={(checked) => 
                  handleSettingChange('compliance', 'auditLogging', checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Security & Access
            </CardTitle>
            <CardDescription>
              Configure security and access control settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
              </div>
              <Switch
                id="two-factor"
                checked={settings.security.twoFactor}
                onCheckedChange={(checked) => 
                  handleSettingChange('security', 'twoFactor', checked)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => 
                  handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                <p className="text-sm text-muted-foreground">Restrict access to specific IPs</p>
              </div>
              <Switch
                id="ip-whitelist"
                checked={settings.security.ipWhitelist}
                onCheckedChange={(checked) => 
                  handleSettingChange('security', 'ipWhitelist', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="encryption">Data Encryption</Label>
                <p className="text-sm text-muted-foreground">Encrypt all stored data</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Enabled</Badge>
                <Switch
                  id="encryption"
                  checked={settings.security.dataEncryption}
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
            <div>
              <h4 className="font-medium">Clear All Data</h4>
              <p className="text-sm text-muted-foreground">
                Remove all uploaded files and analysis results
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Clear Data
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
            <div>
              <h4 className="font-medium">Reset Settings</h4>
              <p className="text-sm text-muted-foreground">
                Reset all settings to default values
              </p>
            </div>
            <Button variant="outline" size="sm">
              Reset Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
