import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { PageHeader } from "./common";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Settings as SettingsIcon,
  Users,
  Building,
  Key,
  Clock,
  Shield,
  Database,
  Bell,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  Webhook,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";

// Mock data
const mockUsers = [
  {
    id: "U001",
    name: "John Smith",
    email: "john.smith@company.com",
    role: "admin",
    status: "active",
    lastActive: "5 min ago",
  },
  {
    id: "U002",
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    role: "manager",
    status: "active",
    lastActive: "2 hours ago",
  },
  {
    id: "U003",
    name: "Mike Wilson",
    email: "mike.w@company.com",
    role: "operator",
    status: "active",
    lastActive: "1 day ago",
  },
  {
    id: "U004",
    name: "Emily Davis",
    email: "emily.d@company.com",
    role: "viewer",
    status: "inactive",
    lastActive: "3 days ago",
  },
];

const mockApiKeys = [
  {
    id: "key_1",
    name: "Production API Key",
    key: "ak_prod_abc123...xyz789",
    fullKey: "ak_prod_abc123def456ghi789jklmno012pqr345stu678vwx901yz234",
    created: "2024-01-15",
    lastUsed: "2 min ago",
    status: "active",
    scopes: ["read:assets", "write:assets", "read:locations"],
  },
  {
    id: "key_2",
    name: "Development API Key",
    key: "ak_dev_def456...uvw012",
    fullKey: "ak_dev_def456ghi789jklmno012pqr345stu678vwx901yz234abc567",
    created: "2024-02-01",
    lastUsed: "1 hour ago",
    status: "active",
    scopes: ["read:assets", "read:locations"],
  },
  {
    id: "key_3",
    name: "Mobile App Key",
    key: "ak_mobile_ghi789...rst345",
    fullKey: "ak_mobile_ghi789jklmno012pqr345stu678vwx901yz234abc567def890",
    created: "2024-03-10",
    lastUsed: "5 min ago",
    status: "active",
    scopes: ["read:assets", "write:checkin", "write:checkout"],
  },
];

const mockWebhooks = [
  {
    id: "wh_1",
    name: "Asset Events Webhook",
    url: "https://api.yourapp.com/webhooks/assets",
    events: ["location_update", "geofence_entry", "battery_low"],
    status: "active",
    created: "2024-09-15",
    lastTriggered: "2 min ago",
  },
  {
    id: "wh_2",
    name: "Maintenance Alerts",
    url: "https://alerts.company.com/webhooks/maintenance",
    events: ["maintenance_due", "maintenance_completed"],
    status: "active",
    created: "2024-09-20",
    lastTriggered: "1 hour ago",
  },
];

const rolePermissions = {
  admin: {
    viewAssets: true,
    editAssets: true,
    deleteAssets: true,
    viewLocations: true,
    manageGeofences: true,
    manageAlerts: true,
    manageUsers: true,
    manageSettings: true,
    viewReports: true,
    exportData: true,
  },
  manager: {
    viewAssets: true,
    editAssets: true,
    deleteAssets: false,
    viewLocations: true,
    manageGeofences: true,
    manageAlerts: true,
    manageUsers: false,
    manageSettings: false,
    viewReports: true,
    exportData: true,
  },
  operator: {
    viewAssets: true,
    editAssets: false,
    deleteAssets: false,
    viewLocations: true,
    manageGeofences: false,
    manageAlerts: false,
    manageUsers: false,
    manageSettings: false,
    viewReports: false,
    exportData: false,
  },
  viewer: {
    viewAssets: true,
    editAssets: false,
    deleteAssets: false,
    viewLocations: true,
    manageGeofences: false,
    manageAlerts: false,
    manageUsers: false,
    manageSettings: false,
    viewReports: true,
    exportData: false,
  },
};

export function Settings() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [users, setUsers] = useState(mockUsers);
  const [apiKeys, setApiKeys] = useState(mockApiKeys);
  const [webhooks, setWebhooks] = useState(mockWebhooks);
  const [permissions, setPermissions] = useState(rolePermissions);
  
  // Dialog states
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isEditPermissionsDialogOpen, setIsEditPermissionsDialogOpen] = useState(false);
  const [isCreateApiKeyDialogOpen, setIsCreateApiKeyDialogOpen] = useState(false);
  const [isAddWebhookDialogOpen, setIsAddWebhookDialogOpen] = useState(false);
  const [isEditWebhookDialogOpen, setIsEditWebhookDialogOpen] = useState(false);
  const [isDeleteWebhookDialogOpen, setIsDeleteWebhookDialogOpen] = useState(false);
  
  // Selected items
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "manager":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "operator":
        return "bg-green-100 text-green-700 border-green-200";
      case "viewer":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // User Management
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditUserDialogOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setIsDeleteUserDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    setUsers(users.filter(u => u.id !== selectedUser.id));
    toast.success("User deleted", {
      description: `${selectedUser.name} has been removed from the organization`,
    });
    setIsDeleteUserDialogOpen(false);
    setSelectedUser(null);
  };

  const saveUserEdits = () => {
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    toast.success("User updated", {
      description: `Changes saved for ${selectedUser.name}`,
    });
    setIsEditUserDialogOpen(false);
    setSelectedUser(null);
  };

  // Role Permissions
  const handleEditPermissions = (role: string) => {
    setSelectedRole(role);
    setIsEditPermissionsDialogOpen(true);
  };

  const handlePermissionToggle = (permission: string) => {
    setPermissions({
      ...permissions,
      [selectedRole]: {
        ...permissions[selectedRole as keyof typeof permissions],
        [permission]: !permissions[selectedRole as keyof typeof permissions][permission as keyof typeof permissions.admin],
      },
    });
  };

  const savePermissions = () => {
    toast.success("Permissions updated", {
      description: `Permissions for ${selectedRole} role have been saved`,
    });
    setIsEditPermissionsDialogOpen(false);
  };

  // API Keys
  const handleCreateApiKey = (data: any) => {
    const generatedKey = `ak_${data.name.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const newKey = {
      id: `key_${apiKeys.length + 1}`,
      name: data.name,
      key: generatedKey.substring(0, 20) + "..." + generatedKey.slice(-6),
      fullKey: generatedKey,
      created: new Date().toISOString().split('T')[0],
      lastUsed: "Never",
      status: "active",
      scopes: data.scopes || [],
    };
    
    setApiKeys([...apiKeys, newKey]);
    setNewApiKey(generatedKey);
    toast.success("API key created", {
      description: "Save this key securely - you won't be able to see it again!",
    });
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== keyId));
    toast.success("API key deleted");
  };

  const handleRegenerateApiKey = (keyId: string) => {
    const generatedKey = `ak_regenerated_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKeys(apiKeys.map(k => k.id === keyId ? {
      ...k,
      key: generatedKey.substring(0, 20) + "..." + generatedKey.slice(-6),
      fullKey: generatedKey,
      lastUsed: "Never",
    } : k));
    setNewApiKey(generatedKey);
    toast.success("API key regenerated", {
      description: "Save this key securely - you won't be able to see it again!",
    });
  };

  // Webhooks
  const handleAddWebhook = (data: any) => {
    const newWebhook = {
      id: `wh_${webhooks.length + 1}`,
      name: data.name,
      url: data.url,
      events: data.events || [],
      status: "active",
      created: new Date().toISOString().split('T')[0],
      lastTriggered: "Never",
    };
    
    setWebhooks([...webhooks, newWebhook]);
    toast.success("Webhook created", {
      description: `${data.name} is now active`,
    });
    setIsAddWebhookDialogOpen(false);
  };

  const handleEditWebhook = (webhook: any) => {
    setSelectedWebhook(webhook);
    setIsEditWebhookDialogOpen(true);
  };

  const saveWebhookEdits = () => {
    setWebhooks(webhooks.map(w => w.id === selectedWebhook.id ? selectedWebhook : w));
    toast.success("Webhook updated");
    setIsEditWebhookDialogOpen(false);
    setSelectedWebhook(null);
  };

  const handleDeleteWebhook = (webhook: any) => {
    setSelectedWebhook(webhook);
    setIsDeleteWebhookDialogOpen(true);
  };

  const confirmDeleteWebhook = () => {
    setWebhooks(webhooks.filter(w => w.id !== selectedWebhook.id));
    toast.success("Webhook deleted");
    setIsDeleteWebhookDialogOpen(false);
    setSelectedWebhook(null);
  };

  const handleTestWebhook = (webhook: any) => {
    toast.success("Test event sent", {
      description: `Test payload sent to ${webhook.url}`,
    });
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Settings"
        description="Manage system configuration, users, and integrations"
      />

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users & Roles
          </TabsTrigger>
          <TabsTrigger value="organization">
            <Building className="h-4 w-4 mr-2" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="system">
            <SettingsIcon className="h-4 w-4 mr-2" />
            System Config
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="h-4 w-4 mr-2" />
            API & Integrations
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Shield className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* Users & Roles Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage users and their permissions</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>
                        Invite a new user to your organization
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-name">Full Name</Label>
                        <Input id="user-name" placeholder="John Smith" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-email">Email</Label>
                        <Input id="user-email" type="email" placeholder="john@company.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-role">Role</Label>
                        <Select defaultValue="viewer">
                          <SelectTrigger id="user-role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="operator">Operator</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button onClick={() => toast.success("User invitation sent")}>
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div>{user.name}</div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.status === "active"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastActive}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Role Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Define what each role can do</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(permissions).map((role) => (
                  <div key={role} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Badge variant="outline" className={getRoleBadgeColor(role)}>
                        {role}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {role === "admin" && "Full system access"}
                        {role === "manager" && "Manage assets, users, and workflows"}
                        {role === "operator" && "Check-in/out assets, view locations"}
                        {role === "viewer" && "Read-only access to dashboards"}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPermissions(role)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Permissions
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Manage your organization details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" defaultValue="Acme Construction Co." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-id">Organization ID</Label>
                <Input id="org-id" value="ORG-12345" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="America/Chicago">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>SSO Integration</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable single sign-on with SAML/OIDC
                  </p>
                </div>
                <Switch />
              </div>
              <div className="pt-4">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Config Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Settings</CardTitle>
              <CardDescription>Configure location tracking parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="update-freq">Location Update Frequency</Label>
                <Select defaultValue="60">
                  <SelectTrigger id="update-freq">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Every 30 seconds</SelectItem>
                    <SelectItem value="60">Every 60 seconds (Recommended)</SelectItem>
                    <SelectItem value="120">Every 2 minutes</SelectItem>
                    <SelectItem value="300">Every 5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retention">Data Retention Period</Label>
                <Select defaultValue="90">
                  <SelectTrigger id="retention">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days (Standard)</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>High-Precision Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use more gateways for improved accuracy (higher cost)
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
              <CardDescription>Configure alert thresholds and delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="battery-threshold">Low Battery Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input id="battery-threshold" type="number" defaultValue="20" className="w-24" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="geofence-delay">Geofence Alert Delay</Label>
                <Select defaultValue="2">
                  <SelectTrigger id="geofence-delay">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Immediate</SelectItem>
                    <SelectItem value="2">2 minutes</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alert Deduplication</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent duplicate alerts within 1 hour
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Integrations Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage API keys for integrations</CardDescription>
                </div>
                <Button onClick={() => setIsCreateApiKeyDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell>{apiKey.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {showApiKey === apiKey.id ? apiKey.fullKey : apiKey.key}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                          >
                            {showApiKey === apiKey.id ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.fullKey, apiKey.id)}
                          >
                            {copiedKey === apiKey.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {apiKey.created}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {apiKey.lastUsed}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                          {apiKey.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRegenerateApiKey(apiKey.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteApiKey(apiKey.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Webhooks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>Configure webhook endpoints for real-time events</CardDescription>
                </div>
                <Button onClick={() => setIsAddWebhookDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Webhook className="h-4 w-4 text-muted-foreground" />
                        <span>{webhook.name}</span>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                          {webhook.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <code className="bg-muted px-2 py-1 rounded">{webhook.url}</code>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {webhook.created} • Last triggered: {webhook.lastTriggered}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTestWebhook(webhook)}
                      >
                        Test
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditWebhook(webhook)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteWebhook(webhook)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ERP/CMMS Integrations</CardTitle>
              <CardDescription>Connect with enterprise systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {["SAP", "ServiceNow", "Procore", "Oracle", "Microsoft Dynamics", "Fiix"].map(
                  (system) => (
                    <div
                      key={system}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Database className="h-8 w-8 text-muted-foreground" />
                        <span>{system}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Connect
                      </Button>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Track all system activities and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input placeholder="Search logs..." className="flex-1" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="user">User Actions</SelectItem>
                      <SelectItem value="asset">Asset Changes</SelectItem>
                      <SelectItem value="settings">Settings Changes</SelectItem>
                      <SelectItem value="access">Access Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          2024-10-04 14:23:15
                        </div>
                      </TableCell>
                      <TableCell>john.smith@company.com</TableCell>
                      <TableCell>
                        <Badge variant="outline">Asset Checkout</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        Checked out Generator-045
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        192.168.1.42
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          2024-10-04 14:15:08
                        </div>
                      </TableCell>
                      <TableCell>sarah.j@company.com</TableCell>
                      <TableCell>
                        <Badge variant="outline">User Created</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        Added new user: mike.w@company.com
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        192.168.1.15
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          2024-10-04 13:45:32
                        </div>
                      </TableCell>
                      <TableCell>admin@company.com</TableCell>
                      <TableCell>
                        <Badge variant="outline">Settings Changed</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        Updated location update frequency to 60s
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        192.168.1.10
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">Showing 3 of 1,247 events</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Previous</Button>
                    <Button variant="outline" size="sm">1</Button>
                    <Button variant="outline" size="sm">2</Button>
                    <Button variant="outline" size="sm">3</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={selectedUser.role}
                  onValueChange={(value) => setSelectedUser({...selectedUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={selectedUser.status}
                  onValueChange={(value) => setSelectedUser({...selectedUser, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveUserEdits}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user <strong>{selectedUser?.name}</strong> ({selectedUser?.email}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditPermissionsDialogOpen} onOpenChange={setIsEditPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role Permissions</DialogTitle>
            <DialogDescription>
              Configure permissions for the <Badge variant="outline" className={getRoleBadgeColor(selectedRole)}>{selectedRole}</Badge> role
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
              {Object.entries(permissions[selectedRole as keyof typeof permissions] || {}).map(([permission, enabled]) => (
                <div key={permission} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="capitalize">{permission.replace(/([A-Z])/g, ' $1').trim()}</Label>
                    <p className="text-sm text-muted-foreground">
                      {permission === 'viewAssets' && 'View asset inventory and details'}
                      {permission === 'editAssets' && 'Modify asset information and settings'}
                      {permission === 'deleteAssets' && 'Delete assets from the system'}
                      {permission === 'viewLocations' && 'View real-time asset locations'}
                      {permission === 'manageGeofences' && 'Create and modify geofences'}
                      {permission === 'manageAlerts' && 'Configure alert rules and notifications'}
                      {permission === 'manageUsers' && 'Add, edit, and remove users'}
                      {permission === 'manageSettings' && 'Modify system configuration'}
                      {permission === 'viewReports' && 'Access analytics and reports'}
                      {permission === 'exportData' && 'Export data and generate reports'}
                    </p>
                  </div>
                  <Switch
                    checked={enabled as boolean}
                    onCheckedChange={() => handlePermissionToggle(permission)}
                  />
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create API Key Dialog */}
      <Dialog open={isCreateApiKeyDialogOpen} onOpenChange={(open) => {
        setIsCreateApiKeyDialogOpen(open);
        if (!open) setNewApiKey(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for integrations
            </DialogDescription>
          </DialogHeader>
          {newApiKey ? (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="h-5 w-5" />
                  <span>API Key Created Successfully!</span>
                </div>
                <p className="text-sm text-green-600">
                  Make sure to copy your API key now. You won't be able to see it again!
                </p>
              </div>
              <div className="space-y-2">
                <Label>Your API Key</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-muted px-3 py-2 rounded border">
                    {newApiKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newApiKey, 'new')}
                  >
                    {copiedKey === 'new' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateApiKey({
                name: formData.get('name'),
                scopes: Array.from(formData.getAll('scopes')),
              });
            }}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key-name">Key Name</Label>
                  <Input 
                    id="api-key-name" 
                    name="name"
                    placeholder="e.g., Production API Key" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permissions (Scopes)</Label>
                  <div className="space-y-2 border rounded-lg p-3">
                    {['read:assets', 'write:assets', 'read:locations', 'write:locations', 'read:alerts', 'write:alerts', 'read:users', 'write:users'].map((scope) => (
                      <div key={scope} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={scope}
                          name="scopes"
                          value={scope}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={scope} className="text-sm cursor-pointer">
                          {scope}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateApiKeyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Key className="h-4 w-4 mr-2" />
                  Generate Key
                </Button>
              </DialogFooter>
            </form>
          )}
          {newApiKey && (
            <DialogFooter>
              <Button onClick={() => {
                setIsCreateApiKeyDialogOpen(false);
                setNewApiKey(null);
              }}>
                Done
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Webhook Dialog */}
      <Dialog open={isAddWebhookDialogOpen} onOpenChange={setIsAddWebhookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>
              Configure a new webhook endpoint for real-time events
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleAddWebhook({
              name: formData.get('name'),
              url: formData.get('url'),
              events: Array.from(formData.getAll('events')),
            });
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-name">Webhook Name</Label>
                <Input 
                  id="webhook-name" 
                  name="name"
                  placeholder="e.g., Asset Events Webhook" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Endpoint URL</Label>
                <Input 
                  id="webhook-url" 
                  name="url"
                  type="url"
                  placeholder="https://api.yourapp.com/webhooks/assets" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Events to Subscribe</Label>
                <div className="space-y-2 border rounded-lg p-3 max-h-[200px] overflow-y-auto">
                  {[
                    'location_update',
                    'geofence_entry',
                    'geofence_exit',
                    'battery_low',
                    'battery_critical',
                    'asset_checkin',
                    'asset_checkout',
                    'maintenance_due',
                    'maintenance_completed',
                    'alert_triggered',
                    'asset_offline',
                    'asset_online',
                  ].map((event) => (
                    <div key={event} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={event}
                        name="events"
                        value={event}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={event} className="text-sm cursor-pointer">
                        {event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddWebhookDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Webhook className="h-4 w-4 mr-2" />
                Create Webhook
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Webhook Dialog */}
      <Dialog open={isEditWebhookDialogOpen} onOpenChange={setIsEditWebhookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Webhook</DialogTitle>
            <DialogDescription>
              Update webhook configuration
            </DialogDescription>
          </DialogHeader>
          {selectedWebhook && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Webhook Name</Label>
                <Input 
                  value={selectedWebhook.name}
                  onChange={(e) => setSelectedWebhook({...selectedWebhook, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Endpoint URL</Label>
                <Input 
                  type="url"
                  value={selectedWebhook.url}
                  onChange={(e) => setSelectedWebhook({...selectedWebhook, url: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={selectedWebhook.status}
                  onValueChange={(value) => setSelectedWebhook({...selectedWebhook, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditWebhookDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveWebhookEdits}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Webhook Alert Dialog */}
      <AlertDialog open={isDeleteWebhookDialogOpen} onOpenChange={setIsDeleteWebhookDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the webhook <strong>{selectedWebhook?.name}</strong>.
              You will stop receiving events at this endpoint.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteWebhook} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Webhook
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
