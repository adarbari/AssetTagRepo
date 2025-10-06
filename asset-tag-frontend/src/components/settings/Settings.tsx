import { useState } from &apos;react&apos;;
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from &apos;../ui/card&apos;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &apos;../ui/tabs&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Switch } from &apos;../ui/switch&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { PageHeader, PageLayout } from &apos;../common&apos;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &apos;../ui/table&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from &apos;../ui/dialog&apos;;
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from &apos;../ui/alert-dialog&apos;;
import {
  Settings as SettingsIcon,
  Users,
  Building,
  Key,
  Clock,
  Shield,
  Database,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  Webhook,
  Eye,
  EyeOff,
  RefreshCw,
} from &apos;lucide-react&apos;;
import { Separator } from &apos;../ui/separator&apos;;
import { toast } from &apos;sonner&apos;;

// Mock data
const mockUsers = [
  {
    id: &apos;U001&apos;,
    name: &apos;John Smith&apos;,
    email: &apos;john.smith@company.com&apos;,
    role: &apos;admin&apos;,
    status: &apos;active&apos;,
    lastActive: &apos;5 min ago&apos;,
  },
  {
    id: &apos;U002&apos;,
    name: &apos;Sarah Johnson&apos;,
    email: &apos;sarah.j@company.com&apos;,
    role: &apos;manager&apos;,
    status: &apos;active&apos;,
    lastActive: &apos;2 hours ago&apos;,
  },
  {
    id: &apos;U003&apos;,
    name: &apos;Mike Wilson&apos;,
    email: &apos;mike.w@company.com&apos;,
    role: &apos;operator&apos;,
    status: &apos;active&apos;,
    lastActive: &apos;1 day ago&apos;,
  },
  {
    id: &apos;U004&apos;,
    name: &apos;Emily Davis&apos;,
    email: &apos;emily.d@company.com&apos;,
    role: &apos;viewer&apos;,
    status: &apos;inactive&apos;,
    lastActive: &apos;3 days ago&apos;,
  },
];

const mockApiKeys = [
  {
    id: &apos;key_1&apos;,
    name: &apos;Production API Key&apos;,
    key: &apos;ak_prod_abc123...xyz789&apos;,
    fullKey: &apos;ak_prod_abc123def456ghi789jklmno012pqr345stu678vwx901yz234&apos;,
    created: &apos;2024-01-15&apos;,
    lastUsed: &apos;2 min ago&apos;,
    status: &apos;active&apos;,
    scopes: [&apos;read:assets&apos;, &apos;write:assets&apos;, &apos;read:locations&apos;],
  },
  {
    id: &apos;key_2&apos;,
    name: &apos;Development API Key&apos;,
    key: &apos;ak_dev_def456...uvw012&apos;,
    fullKey: &apos;ak_dev_def456ghi789jklmno012pqr345stu678vwx901yz234abc567&apos;,
    created: &apos;2024-02-01&apos;,
    lastUsed: &apos;1 hour ago&apos;,
    status: &apos;active&apos;,
    scopes: [&apos;read:assets&apos;, &apos;read:locations&apos;],
  },
  {
    id: &apos;key_3&apos;,
    name: &apos;Mobile App Key&apos;,
    key: &apos;ak_mobile_ghi789...rst345&apos;,
    fullKey: &apos;ak_mobile_ghi789jklmno012pqr345stu678vwx901yz234abc567def890&apos;,
    created: &apos;2024-03-10&apos;,
    lastUsed: &apos;5 min ago&apos;,
    status: &apos;active&apos;,
    scopes: [&apos;read:assets&apos;, &apos;write:checkin&apos;, &apos;write:checkout&apos;],
  },
];

const mockWebhooks = [
  {
    id: &apos;wh_1&apos;,
    name: &apos;Asset Events Webhook&apos;,
    url: &apos;https://api.yourapp.com/webhooks/assets&apos;,
    events: [&apos;location_update&apos;, &apos;geofence_entry&apos;, &apos;battery_low&apos;],
    status: &apos;active&apos;,
    created: &apos;2024-09-15&apos;,
    lastTriggered: &apos;2 min ago&apos;,
  },
  {
    id: &apos;wh_2&apos;,
    name: &apos;Maintenance Alerts&apos;,
    url: &apos;https://alerts.company.com/webhooks/maintenance&apos;,
    events: [&apos;maintenance_due&apos;, &apos;maintenance_completed&apos;],
    status: &apos;active&apos;,
    created: &apos;2024-09-20&apos;,
    lastTriggered: &apos;1 hour ago&apos;,
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
  const [isEditPermissionsDialogOpen, setIsEditPermissionsDialogOpen] =
    useState(false);
  const [isCreateApiKeyDialogOpen, setIsCreateApiKeyDialogOpen] =
    useState(false);
  const [isAddWebhookDialogOpen, setIsAddWebhookDialogOpen] = useState(false);
  const [isEditWebhookDialogOpen, setIsEditWebhookDialogOpen] = useState(false);
  const [isDeleteWebhookDialogOpen, setIsDeleteWebhookDialogOpen] =
    useState(false);

  // Selected items
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>(&apos;&apos;);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    toast.success(&apos;Copied to clipboard&apos;);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case &apos;admin&apos;:
        return &apos;bg-purple-100 text-purple-700 border-purple-200&apos;;
      case &apos;manager&apos;:
        return &apos;bg-blue-100 text-blue-700 border-blue-200&apos;;
      case &apos;operator&apos;:
        return &apos;bg-green-100 text-green-700 border-green-200&apos;;
      case &apos;viewer&apos;:
        return &apos;bg-gray-100 text-gray-700 border-gray-200&apos;;
      default:
        return &apos;bg-gray-100 text-gray-700 border-gray-200&apos;;
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
    toast.success(&apos;User deleted&apos;, {
      description: `${selectedUser.name} has been removed from the organization`,
    });
    setIsDeleteUserDialogOpen(false);
    setSelectedUser(null);
  };

  const saveUserEdits = () => {
    setUsers(users.map(u => (u.id === selectedUser.id ? selectedUser : u)));
    toast.success(&apos;User updated&apos;, {
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
        [permission]:
          !permissions[selectedRole as keyof typeof permissions][
            permission as keyof typeof permissions.admin
          ],
      },
    });
  };

  const savePermissions = () => {
    toast.success(&apos;Permissions updated&apos;, {
      description: `Permissions for ${selectedRole} role have been saved`,
    });
    setIsEditPermissionsDialogOpen(false);
  };

  // API Keys
  const handleCreateApiKey = (data: any) => {
    const generatedKey = `ak_${data.name.toLowerCase().replace(/\s+/g, &apos;_&apos;)}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const newKey = {
      id: `key_${apiKeys.length + 1}`,
      name: data.name,
      key: generatedKey.substring(0, 20) + &apos;...&apos; + generatedKey.slice(-6),
      fullKey: generatedKey,
      created: new Date().toISOString().split(&apos;T&apos;)[0],
      lastUsed: &apos;Never&apos;,
      status: &apos;active&apos;,
      scopes: data.scopes || [],
    };

    setApiKeys([...apiKeys, newKey]);
    setNewApiKey(generatedKey);
    toast.success(&apos;API key created&apos;, {
      description:
        &quot;Save this key securely - you won&apos;t be able to see it again!&quot;,
    });
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== keyId));
    toast.success(&apos;API key deleted&apos;);
  };

  const handleRegenerateApiKey = (keyId: string) => {
    const generatedKey = `ak_regenerated_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKeys(
      apiKeys.map(k =>
        k.id === keyId
          ? {
              ...k,
              key:
                generatedKey.substring(0, 20) + &apos;...&apos; + generatedKey.slice(-6),
              fullKey: generatedKey,
              lastUsed: &apos;Never&apos;,
            }
          : k
      )
    );
    setNewApiKey(generatedKey);
    toast.success(&apos;API key regenerated&apos;, {
      description:
        &quot;Save this key securely - you won&apos;t be able to see it again!&quot;,
    });
  };

  // Webhooks
  const handleAddWebhook = (data: any) => {
    const newWebhook = {
      id: `wh_${webhooks.length + 1}`,
      name: data.name,
      url: data.url,
      events: data.events || [],
      status: &apos;active&apos;,
      created: new Date().toISOString().split(&apos;T&apos;)[0],
      lastTriggered: &apos;Never&apos;,
    };

    setWebhooks([...webhooks, newWebhook]);
    toast.success(&apos;Webhook created&apos;, {
      description: `${data.name} is now active`,
    });
    setIsAddWebhookDialogOpen(false);
  };

  const handleEditWebhook = (webhook: any) => {
    setSelectedWebhook(webhook);
    setIsEditWebhookDialogOpen(true);
  };

  const saveWebhookEdits = () => {
    setWebhooks(
      webhooks.map(w => (w.id === selectedWebhook.id ? selectedWebhook : w))
    );
    toast.success(&apos;Webhook updated&apos;);
    setIsEditWebhookDialogOpen(false);
    setSelectedWebhook(null);
  };

  const handleDeleteWebhook = (webhook: any) => {
    setSelectedWebhook(webhook);
    setIsDeleteWebhookDialogOpen(true);
  };

  const confirmDeleteWebhook = () => {
    setWebhooks(webhooks.filter(w => w.id !== selectedWebhook.id));
    toast.success(&apos;Webhook deleted&apos;);
    setIsDeleteWebhookDialogOpen(false);
    setSelectedWebhook(null);
  };

  const handleTestWebhook = (webhook: any) => {
    toast.success(&apos;Test event sent&apos;, {
      description: `Test payload sent to ${webhook.url}`,
    });
  };

  return (
    <PageLayout variant=&apos;standard&apos; padding=&apos;lg&apos;>
      <PageHeader
        title=&apos;Settings&apos;
        description=&apos;Manage system configuration, users, and integrations&apos;
      />

      <Tabs defaultValue=&apos;users&apos; className=&apos;space-y-6&apos;>
        <TabsList>
          <TabsTrigger value=&apos;users&apos;>
            <Users className=&apos;h-4 w-4 mr-2&apos; />
            Users & Roles
          </TabsTrigger>
          <TabsTrigger value=&apos;organization&apos;>
            <Building className=&apos;h-4 w-4 mr-2&apos; />
            Organization
          </TabsTrigger>
          <TabsTrigger value=&apos;system&apos;>
            <SettingsIcon className=&apos;h-4 w-4 mr-2&apos; />
            System Config
          </TabsTrigger>
          <TabsTrigger value=&apos;api&apos;>
            <Key className=&apos;h-4 w-4 mr-2&apos; />
            API & Integrations
          </TabsTrigger>
          <TabsTrigger value=&apos;audit&apos;>
            <Shield className=&apos;h-4 w-4 mr-2&apos; />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* Users & Roles Tab */}
        <TabsContent value=&apos;users&apos; className=&apos;space-y-4&apos;>
          <Card>
            <CardHeader>
              <div className=&apos;flex items-center justify-between&apos;>
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage users and their permissions
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className=&apos;h-4 w-4 mr-2&apos; />
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
                    <div className=&apos;space-y-4 py-4&apos;>
                      <div className=&apos;space-y-2&apos;>
                        <Label htmlFor=&apos;user-name&apos;>Full Name</Label>
                        <Input id=&apos;user-name&apos; placeholder=&apos;John Smith&apos; />
                      </div>
                      <div className=&apos;space-y-2&apos;>
                        <Label htmlFor=&apos;user-email&apos;>Email</Label>
                        <Input
                          id=&apos;user-email&apos;
                          type=&apos;email&apos;
                          placeholder=&apos;john@company.com&apos;
                        />
                      </div>
                      <div className=&apos;space-y-2&apos;>
                        <Label htmlFor=&apos;user-role&apos;>Role</Label>
                        <Select defaultValue=&apos;viewer&apos;>
                          <SelectTrigger id=&apos;user-role&apos;>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value=&apos;admin&apos;>Admin</SelectItem>
                            <SelectItem value=&apos;manager&apos;>Manager</SelectItem>
                            <SelectItem value=&apos;operator&apos;>Operator</SelectItem>
                            <SelectItem value=&apos;viewer&apos;>Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant=&apos;outline&apos;>Cancel</Button>
                      <Button
                        onClick={() => toast.success(&apos;User invitation sent&apos;)}
                      >
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
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div>{user.name}</div>
                          <p className=&apos;text-sm text-muted-foreground&apos;>
                            {user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant=&apos;outline&apos;
                          className={getRoleBadgeColor(user.role)}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant=&apos;outline&apos;
                          className={
                            user.status === &apos;active&apos;
                              ? &apos;bg-green-100 text-green-700 border-green-200&apos;
                              : &apos;bg-gray-100 text-gray-700 border-gray-200&apos;
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className=&apos;text-sm text-muted-foreground&apos;>
                        {user.lastActive}
                      </TableCell>
                      <TableCell>
                        <div className=&apos;flex items-center gap-2&apos;>
                          <Button
                            variant=&apos;ghost&apos;
                            size=&apos;sm&apos;
                            onClick={() => handleEditUser(user)}
                            aria-label={`Edit user ${user.name}`}
                          >
                            <Edit className=&apos;h-4 w-4&apos; />
                          </Button>
                          <Button
                            variant=&apos;ghost&apos;
                            size=&apos;sm&apos;
                            onClick={() => handleDeleteUser(user)}
                            aria-label={`Delete user ${user.name}`}
                          >
                            <Trash2 className=&apos;h-4 w-4 text-destructive&apos; />
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
              <div className=&apos;space-y-4&apos;>
                {Object.keys(permissions).map(role => (
                  <div
                    key={role}
                    className=&apos;flex items-center justify-between p-4 border rounded-lg&apos;
                  >
                    <div>
                      <Badge
                        variant=&apos;outline&apos;
                        className={getRoleBadgeColor(role)}
                      >
                        {role}
                      </Badge>
                      <p className=&apos;text-sm text-muted-foreground mt-1&apos;>
                        {role === &apos;admin&apos; && &apos;Full system access&apos;}
                        {role === &apos;manager&apos; &&
                          &apos;Manage assets, users, and workflows&apos;}
                        {role === &apos;operator&apos; &&
                          &apos;Check-in/out assets, view locations&apos;}
                        {role === &apos;viewer&apos; && &apos;Read-only access to dashboards&apos;}
                      </p>
                    </div>
                    <Button
                      variant=&apos;outline&apos;
                      size=&apos;sm&apos;
                      onClick={() => handleEditPermissions(role)}
                    >
                      <Edit className=&apos;h-4 w-4 mr-2&apos; />
                      Edit Permissions
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value=&apos;organization&apos; className=&apos;space-y-4&apos;>
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Manage your organization details
              </CardDescription>
            </CardHeader>
            <CardContent className=&apos;space-y-6&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;org-name&apos;>Organization Name</Label>
                <Input id=&apos;org-name&apos; defaultValue=&apos;Acme Construction Co.&apos; />
              </div>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;org-id&apos;>Organization ID</Label>
                <Input id=&apos;org-id&apos; value=&apos;ORG-12345&apos; disabled />
              </div>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;timezone&apos;>Timezone</Label>
                <Select defaultValue=&apos;America/Chicago&apos;>
                  <SelectTrigger id=&apos;timezone&apos;>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;America/New_York&apos;>
                      Eastern Time
                    </SelectItem>
                    <SelectItem value=&apos;America/Chicago&apos;>
                      Central Time
                    </SelectItem>
                    <SelectItem value=&apos;America/Denver&apos;>
                      Mountain Time
                    </SelectItem>
                    <SelectItem value=&apos;America/Los_Angeles&apos;>
                      Pacific Time
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className=&apos;flex items-center justify-between&apos;>
                <div className=&apos;space-y-1&apos;>
                  <Label>SSO Integration</Label>
                  <p className=&apos;text-sm text-muted-foreground&apos;>
                    Enable single sign-on with SAML/OIDC
                  </p>
                </div>
                <Switch />
              </div>
              <div className=&apos;pt-4&apos;>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Config Tab */}
        <TabsContent value=&apos;system&apos; className=&apos;space-y-4&apos;>
          <Card>
            <CardHeader>
              <CardTitle>Location Settings</CardTitle>
              <CardDescription>
                Configure location tracking parameters
              </CardDescription>
            </CardHeader>
            <CardContent className=&apos;space-y-6&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;update-freq&apos;>Location Update Frequency</Label>
                <Select defaultValue=&apos;60&apos;>
                  <SelectTrigger id=&apos;update-freq&apos;>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;30&apos;>Every 30 seconds</SelectItem>
                    <SelectItem value=&apos;60&apos;>
                      Every 60 seconds (Recommended)
                    </SelectItem>
                    <SelectItem value=&apos;120&apos;>Every 2 minutes</SelectItem>
                    <SelectItem value=&apos;300&apos;>Every 5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;retention&apos;>Data Retention Period</Label>
                <Select defaultValue=&apos;90&apos;>
                  <SelectTrigger id=&apos;retention&apos;>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;30&apos;>30 days</SelectItem>
                    <SelectItem value=&apos;90&apos;>90 days (Standard)</SelectItem>
                    <SelectItem value=&apos;180&apos;>180 days</SelectItem>
                    <SelectItem value=&apos;365&apos;>1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className=&apos;flex items-center justify-between&apos;>
                <div className=&apos;space-y-1&apos;>
                  <Label>High-Precision Mode</Label>
                  <p className=&apos;text-sm text-muted-foreground&apos;>
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
              <CardDescription>
                Configure alert thresholds and delivery
              </CardDescription>
            </CardHeader>
            <CardContent className=&apos;space-y-6&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;battery-threshold&apos;>Low Battery Threshold</Label>
                <div className=&apos;flex items-center gap-2&apos;>
                  <Input
                    id=&apos;battery-threshold&apos;
                    type=&apos;number&apos;
                    defaultValue=&apos;20&apos;
                    className=&apos;w-24&apos;
                  />
                  <span className=&apos;text-sm text-muted-foreground&apos;>%</span>
                </div>
              </div>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;geofence-delay&apos;>Geofence Alert Delay</Label>
                <Select defaultValue=&apos;2&apos;>
                  <SelectTrigger id=&apos;geofence-delay&apos;>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;0&apos;>Immediate</SelectItem>
                    <SelectItem value=&apos;2&apos;>2 minutes</SelectItem>
                    <SelectItem value=&apos;5&apos;>5 minutes</SelectItem>
                    <SelectItem value=&apos;10&apos;>10 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className=&apos;flex items-center justify-between&apos;>
                <div className=&apos;space-y-1&apos;>
                  <Label>Alert Deduplication</Label>
                  <p className=&apos;text-sm text-muted-foreground&apos;>
                    Prevent duplicate alerts within 1 hour
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Integrations Tab */}
        <TabsContent value=&apos;api&apos; className=&apos;space-y-4&apos;>
          <Card>
            <CardHeader>
              <div className=&apos;flex items-center justify-between&apos;>
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Manage API keys for integrations
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreateApiKeyDialogOpen(true)}>
                  <Plus className=&apos;h-4 w-4 mr-2&apos; />
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
                  {apiKeys.map(apiKey => (
                    <TableRow key={apiKey.id}>
                      <TableCell>{apiKey.name}</TableCell>
                      <TableCell>
                        <div className=&apos;flex items-center gap-2&apos;>
                          <code className=&apos;text-sm bg-muted px-2 py-1 rounded&apos;>
                            {showApiKey === apiKey.id
                              ? apiKey.fullKey
                              : apiKey.key}
                          </code>
                          <Button
                            variant=&apos;ghost&apos;
                            size=&apos;sm&apos;
                            onClick={() =>
                              setShowApiKey(
                                showApiKey === apiKey.id ? null : apiKey.id
                              )
                            }
                          >
                            {showApiKey === apiKey.id ? (
                              <EyeOff className=&apos;h-4 w-4&apos; />
                            ) : (
                              <Eye className=&apos;h-4 w-4&apos; />
                            )}
                          </Button>
                          <Button
                            variant=&apos;ghost&apos;
                            size=&apos;sm&apos;
                            onClick={() =>
                              copyToClipboard(apiKey.fullKey, apiKey.id)
                            }
                          >
                            {copiedKey === apiKey.id ? (
                              <Check className=&apos;h-4 w-4 text-green-600&apos; />
                            ) : (
                              <Copy className=&apos;h-4 w-4&apos; />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className=&apos;text-sm text-muted-foreground&apos;>
                        {apiKey.created}
                      </TableCell>
                      <TableCell className=&apos;text-sm text-muted-foreground&apos;>
                        {apiKey.lastUsed}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant=&apos;outline&apos;
                          className=&apos;bg-green-100 text-green-700 border-green-200&apos;
                        >
                          {apiKey.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className=&apos;flex items-center gap-2&apos;>
                          <Button
                            variant=&apos;ghost&apos;
                            size=&apos;sm&apos;
                            onClick={() => handleRegenerateApiKey(apiKey.id)}
                          >
                            <RefreshCw className=&apos;h-4 w-4&apos; />
                          </Button>
                          <Button
                            variant=&apos;ghost&apos;
                            size=&apos;sm&apos;
                            onClick={() => handleDeleteApiKey(apiKey.id)}
                            aria-label={`Delete API key ${apiKey.name}`}
                          >
                            <Trash2 className=&apos;h-4 w-4 text-destructive&apos; />
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
              <div className=&apos;flex items-center justify-between&apos;>
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>
                    Configure webhook endpoints for real-time events
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddWebhookDialogOpen(true)}>
                  <Plus className=&apos;h-4 w-4 mr-2&apos; />
                  Add Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className=&apos;space-y-4&apos;>
                {webhooks.map(webhook => (
                  <div
                    key={webhook.id}
                    className=&apos;flex items-start justify-between p-4 border rounded-lg&apos;
                  >
                    <div className=&apos;space-y-2 flex-1&apos;>
                      <div className=&apos;flex items-center gap-2&apos;>
                        <Webhook className=&apos;h-4 w-4 text-muted-foreground&apos; />
                        <span>{webhook.name}</span>
                        <Badge
                          variant=&apos;outline&apos;
                          className=&apos;bg-green-100 text-green-700 border-green-200&apos;
                        >
                          {webhook.status}
                        </Badge>
                      </div>
                      <div className=&apos;text-sm text-muted-foreground&apos;>
                        <code className=&apos;bg-muted px-2 py-1 rounded&apos;>
                          {webhook.url}
                        </code>
                      </div>
                      <div className=&apos;flex flex-wrap gap-1&apos;>
                        {webhook.events.map(event => (
                          <Badge
                            key={event}
                            variant=&apos;outline&apos;
                            className=&apos;text-xs&apos;
                          >
                            {event}
                          </Badge>
                        ))}
                      </div>
                      <div className=&apos;text-xs text-muted-foreground&apos;>
                        Created: {webhook.created} • Last triggered:{&apos; &apos;}
                        {webhook.lastTriggered}
                      </div>
                    </div>
                    <div className=&apos;flex items-center gap-2&apos;>
                      <Button
                        variant=&apos;outline&apos;
                        size=&apos;sm&apos;
                        onClick={() => handleTestWebhook(webhook)}
                      >
                        Test
                      </Button>
                      <Button
                        variant=&apos;outline&apos;
                        size=&apos;sm&apos;
                        onClick={() => handleEditWebhook(webhook)}
                        aria-label={`Edit webhook ${webhook.name}`}
                      >
                        <Edit className=&apos;h-4 w-4&apos; />
                      </Button>
                      <Button
                        variant=&apos;ghost&apos;
                        size=&apos;sm&apos;
                        onClick={() => handleDeleteWebhook(webhook)}
                        aria-label={`Delete webhook ${webhook.name}`}
                      >
                        <Trash2 className=&apos;h-4 w-4 text-destructive&apos; />
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
              <div className=&apos;grid grid-cols-2 gap-4&apos;>
                {[
                  &apos;SAP&apos;,
                  &apos;ServiceNow&apos;,
                  &apos;Procore&apos;,
                  &apos;Oracle&apos;,
                  &apos;Microsoft Dynamics&apos;,
                  &apos;Fiix&apos;,
                ].map(system => (
                  <div
                    key={system}
                    className=&apos;flex items-center justify-between p-4 border rounded-lg&apos;
                  >
                    <div className=&apos;flex items-center gap-3&apos;>
                      <Database className=&apos;h-8 w-8 text-muted-foreground&apos; />
                      <span>{system}</span>
                    </div>
                    <Button variant=&apos;outline&apos; size=&apos;sm&apos;>
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value=&apos;audit&apos; className=&apos;space-y-4&apos;>
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Track all system activities and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&apos;space-y-4&apos;>
                <div className=&apos;flex items-center gap-2&apos;>
                  <Input placeholder=&apos;Search logs...&apos; className=&apos;flex-1&apos; />
                  <Select defaultValue=&apos;all&apos;>
                    <SelectTrigger className=&apos;w-48&apos;>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&apos;all&apos;>All Events</SelectItem>
                      <SelectItem value=&apos;user&apos;>User Actions</SelectItem>
                      <SelectItem value=&apos;asset&apos;>Asset Changes</SelectItem>
                      <SelectItem value=&apos;settings&apos;>Settings Changes</SelectItem>
                      <SelectItem value=&apos;access&apos;>Access Events</SelectItem>
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
                      <TableCell className=&apos;text-sm&apos;>
                        <div className=&apos;flex items-center gap-2&apos;>
                          <Clock className=&apos;h-4 w-4 text-muted-foreground&apos; />
                          2024-10-04 14:23:15
                        </div>
                      </TableCell>
                      <TableCell>john.smith@company.com</TableCell>
                      <TableCell>
                        <Badge variant=&apos;outline&apos;>Asset Checkout</Badge>
                      </TableCell>
                      <TableCell className=&apos;text-sm text-muted-foreground&apos;>
                        Checked out Generator-045
                      </TableCell>
                      <TableCell className=&apos;text-sm text-muted-foreground&apos;>
                        192.168.1.42
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className=&apos;text-sm&apos;>
                        <div className=&apos;flex items-center gap-2&apos;>
                          <Clock className=&apos;h-4 w-4 text-muted-foreground&apos; />
                          2024-10-04 14:15:08
                        </div>
                      </TableCell>
                      <TableCell>sarah.j@company.com</TableCell>
                      <TableCell>
                        <Badge variant=&apos;outline&apos;>User Created</Badge>
                      </TableCell>
                      <TableCell className=&apos;text-sm text-muted-foreground&apos;>
                        Added new user: mike.w@company.com
                      </TableCell>
                      <TableCell className=&apos;text-sm text-muted-foreground&apos;>
                        192.168.1.15
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className=&apos;text-sm&apos;>
                        <div className=&apos;flex items-center gap-2&apos;>
                          <Clock className=&apos;h-4 w-4 text-muted-foreground&apos; />
                          2024-10-04 13:45:32
                        </div>
                      </TableCell>
                      <TableCell>admin@company.com</TableCell>
                      <TableCell>
                        <Badge variant=&apos;outline&apos;>Settings Changed</Badge>
                      </TableCell>
                      <TableCell className=&apos;text-sm text-muted-foreground&apos;>
                        Updated location update frequency to 60s
                      </TableCell>
                      <TableCell className=&apos;text-sm text-muted-foreground&apos;>
                        192.168.1.10
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className=&apos;flex items-center justify-between pt-4&apos;>
                  <p className=&apos;text-sm text-muted-foreground&apos;>
                    Showing 3 of 1,247 events
                  </p>
                  <div className=&apos;flex items-center gap-2&apos;>
                    <Button variant=&apos;outline&apos; size=&apos;sm&apos;>
                      Previous
                    </Button>
                    <Button variant=&apos;outline&apos; size=&apos;sm&apos;>
                      1
                    </Button>
                    <Button variant=&apos;outline&apos; size=&apos;sm&apos;>
                      2
                    </Button>
                    <Button variant=&apos;outline&apos; size=&apos;sm&apos;>
                      3
                    </Button>
                    <Button variant=&apos;outline&apos; size=&apos;sm&apos;>
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className=&apos;space-y-4 py-4&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label>Full Name</Label>
                <Input
                  value={selectedUser.name}
                  onChange={e =>
                    setSelectedUser({ ...selectedUser, name: e.target.value })
                  }
                />
              </div>
              <div className=&apos;space-y-2&apos;>
                <Label>Email</Label>
                <Input
                  type=&apos;email&apos;
                  value={selectedUser.email}
                  onChange={e =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                />
              </div>
              <div className=&apos;space-y-2&apos;>
                <Label>Role</Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={value =>
                    setSelectedUser({ ...selectedUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;admin&apos;>Admin</SelectItem>
                    <SelectItem value=&apos;manager&apos;>Manager</SelectItem>
                    <SelectItem value=&apos;operator&apos;>Operator</SelectItem>
                    <SelectItem value=&apos;viewer&apos;>Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className=&apos;space-y-2&apos;>
                <Label>Status</Label>
                <Select
                  value={selectedUser.status}
                  onValueChange={value =>
                    setSelectedUser({ ...selectedUser, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;active&apos;>Active</SelectItem>
                    <SelectItem value=&apos;inactive&apos;>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant=&apos;outline&apos;
              onClick={() => setIsEditUserDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveUserEdits}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog
        open={isDeleteUserDialogOpen}
        onOpenChange={setIsDeleteUserDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user{&apos; &apos;}
              <strong>{selectedUser?.name}</strong> ({selectedUser?.email}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className=&apos;bg-destructive text-destructive-foreground hover:bg-destructive/90&apos;
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Permissions Dialog */}
      <Dialog
        open={isEditPermissionsDialogOpen}
        onOpenChange={setIsEditPermissionsDialogOpen}
      >
        <DialogContent className=&apos;max-w-2xl&apos;>
          <DialogHeader>
            <DialogTitle>Edit Role Permissions</DialogTitle>
            <DialogDescription>
              Configure permissions for the{&apos; &apos;}
              <Badge
                variant=&apos;outline&apos;
                className={getRoleBadgeColor(selectedRole)}
              >
                {selectedRole}
              </Badge>{&apos; &apos;}
              role
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className=&apos;space-y-4 py-4 max-h-[400px] overflow-y-auto&apos;>
              {Object.entries(
                permissions[selectedRole as keyof typeof permissions] || {}
              ).map(([permission, enabled]) => (
                <div
                  key={permission}
                  className=&apos;flex items-center justify-between p-3 border rounded-lg&apos;
                >
                  <div>
                    <Label className=&apos;capitalize&apos;>
                      {permission.replace(/([A-Z])/g, &apos; $1&apos;).trim()}
                    </Label>
                    <p className=&apos;text-sm text-muted-foreground&apos;>
                      {permission === &apos;viewAssets&apos; &&
                        &apos;View asset inventory and details&apos;}
                      {permission === &apos;editAssets&apos; &&
                        &apos;Modify asset information and settings&apos;}
                      {permission === &apos;deleteAssets&apos; &&
                        &apos;Delete assets from the system&apos;}
                      {permission === &apos;viewLocations&apos; &&
                        &apos;View real-time asset locations&apos;}
                      {permission === &apos;manageGeofences&apos; &&
                        &apos;Create and modify geofences&apos;}
                      {permission === &apos;manageAlerts&apos; &&
                        &apos;Configure alert rules and notifications&apos;}
                      {permission === &apos;manageUsers&apos; &&
                        &apos;Add, edit, and remove users&apos;}
                      {permission === &apos;manageSettings&apos; &&
                        &apos;Modify system configuration&apos;}
                      {permission === &apos;viewReports&apos; &&
                        &apos;Access analytics and reports&apos;}
                      {permission === &apos;exportData&apos; &&
                        &apos;Export data and generate reports&apos;}
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
            <Button
              variant=&apos;outline&apos;
              onClick={() => setIsEditPermissionsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={savePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create API Key Dialog */}
      <Dialog
        open={isCreateApiKeyDialogOpen}
        onOpenChange={open => {
          setIsCreateApiKeyDialogOpen(open);
          if (!open) setNewApiKey(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for integrations
            </DialogDescription>
          </DialogHeader>
          {newApiKey ? (
            <div className=&apos;space-y-4 py-4&apos;>
              <div className=&apos;p-4 bg-green-50 border border-green-200 rounded-lg space-y-2&apos;>
                <div className=&apos;flex items-center gap-2 text-green-700&apos;>
                  <Check className=&apos;h-5 w-5&apos; />
                  <span>API Key Created Successfully!</span>
                </div>
                <p className=&apos;text-sm text-green-600&apos;>
                  Make sure to copy your API key now. You won&apos;t be able to see
                  it again!
                </p>
              </div>
              <div className=&apos;space-y-2&apos;>
                <Label>Your API Key</Label>
                <div className=&apos;flex items-center gap-2&apos;>
                  <code className=&apos;flex-1 text-sm bg-muted px-3 py-2 rounded border&apos;>
                    {newApiKey}
                  </code>
                  <Button
                    variant=&apos;outline&apos;
                    size=&apos;sm&apos;
                    onClick={() => copyToClipboard(newApiKey, &apos;new&apos;)}
                  >
                    {copiedKey === &apos;new&apos; ? (
                      <Check className=&apos;h-4 w-4 text-green-600&apos; />
                    ) : (
                      <Copy className=&apos;h-4 w-4&apos; />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateApiKey({
                  name: formData.get(&apos;name&apos;),
                  scopes: Array.from(formData.getAll(&apos;scopes&apos;)),
                });
              }}
            >
              <div className=&apos;space-y-4 py-4&apos;>
                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;api-key-name&apos;>Key Name</Label>
                  <Input
                    id=&apos;api-key-name&apos;
                    name=&apos;name&apos;
                    placeholder=&apos;e.g., Production API Key&apos;
                    required
                  />
                </div>
                <div className=&apos;space-y-2&apos;>
                  <Label>Permissions (Scopes)</Label>
                  <div className=&apos;space-y-2 border rounded-lg p-3&apos;>
                    {[
                      &apos;read:assets&apos;,
                      &apos;write:assets&apos;,
                      &apos;read:locations&apos;,
                      &apos;write:locations&apos;,
                      &apos;read:alerts&apos;,
                      &apos;write:alerts&apos;,
                      &apos;read:users&apos;,
                      &apos;write:users&apos;,
                    ].map(scope => (
                      <div key={scope} className=&apos;flex items-center gap-2&apos;>
                        <input
                          type=&apos;checkbox&apos;
                          id={scope}
                          name=&apos;scopes&apos;
                          value={scope}
                          className=&apos;rounded border-gray-300&apos;
                        />
                        <Label
                          htmlFor={scope}
                          className=&apos;text-sm cursor-pointer&apos;
                        >
                          {scope}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type=&apos;button&apos;
                  variant=&apos;outline&apos;
                  onClick={() => setIsCreateApiKeyDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type=&apos;submit&apos;>
                  <Key className=&apos;h-4 w-4 mr-2&apos; />
                  Generate Key
                </Button>
              </DialogFooter>
            </form>
          )}
          {newApiKey && (
            <DialogFooter>
              <Button
                onClick={() => {
                  setIsCreateApiKeyDialogOpen(false);
                  setNewApiKey(null);
                }}
              >
                Done
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Webhook Dialog */}
      <Dialog
        open={isAddWebhookDialogOpen}
        onOpenChange={setIsAddWebhookDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>
              Configure a new webhook endpoint for real-time events
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddWebhook({
                name: formData.get(&apos;name&apos;),
                url: formData.get(&apos;url&apos;),
                events: Array.from(formData.getAll(&apos;events&apos;)),
              });
            }}
          >
            <div className=&apos;space-y-4 py-4&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;webhook-name&apos;>Webhook Name</Label>
                <Input
                  id=&apos;webhook-name&apos;
                  name=&apos;name&apos;
                  placeholder=&apos;e.g., Asset Events Webhook&apos;
                  required
                />
              </div>
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;webhook-url&apos;>Endpoint URL</Label>
                <Input
                  id=&apos;webhook-url&apos;
                  name=&apos;url&apos;
                  type=&apos;url&apos;
                  placeholder=&apos;https://api.yourapp.com/webhooks/assets&apos;
                  required
                />
              </div>
              <div className=&apos;space-y-2&apos;>
                <Label>Events to Subscribe</Label>
                <div className=&apos;space-y-2 border rounded-lg p-3 max-h-[200px] overflow-y-auto&apos;>
                  {[
                    &apos;location_update&apos;,
                    &apos;geofence_entry&apos;,
                    &apos;geofence_exit&apos;,
                    &apos;battery_low&apos;,
                    &apos;battery_critical&apos;,
                    &apos;asset_checkin&apos;,
                    &apos;asset_checkout&apos;,
                    &apos;maintenance_due&apos;,
                    &apos;maintenance_completed&apos;,
                    &apos;alert_triggered&apos;,
                    &apos;asset_offline&apos;,
                    &apos;asset_online&apos;,
                  ].map(event => (
                    <div key={event} className=&apos;flex items-center gap-2&apos;>
                      <input
                        type=&apos;checkbox&apos;
                        id={event}
                        name=&apos;events&apos;
                        value={event}
                        className=&apos;rounded border-gray-300&apos;
                      />
                      <Label htmlFor={event} className=&apos;text-sm cursor-pointer&apos;>
                        {event
                          .replace(/_/g, &apos; &apos;)
                          .replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type=&apos;button&apos;
                variant=&apos;outline&apos;
                onClick={() => setIsAddWebhookDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type=&apos;submit&apos;>
                <Webhook className=&apos;h-4 w-4 mr-2&apos; />
                Create Webhook
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Webhook Dialog */}
      <Dialog
        open={isEditWebhookDialogOpen}
        onOpenChange={setIsEditWebhookDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Webhook</DialogTitle>
            <DialogDescription>Update webhook configuration</DialogDescription>
          </DialogHeader>
          {selectedWebhook && (
            <div className=&apos;space-y-4 py-4&apos;>
              <div className=&apos;space-y-2&apos;>
                <Label>Webhook Name</Label>
                <Input
                  value={selectedWebhook.name}
                  onChange={e =>
                    setSelectedWebhook({
                      ...selectedWebhook,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className=&apos;space-y-2&apos;>
                <Label>Endpoint URL</Label>
                <Input
                  type=&apos;url&apos;
                  value={selectedWebhook.url}
                  onChange={e =>
                    setSelectedWebhook({
                      ...selectedWebhook,
                      url: e.target.value,
                    })
                  }
                />
              </div>
              <div className=&apos;space-y-2&apos;>
                <Label>Status</Label>
                <Select
                  value={selectedWebhook.status}
                  onValueChange={value =>
                    setSelectedWebhook({ ...selectedWebhook, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;active&apos;>Active</SelectItem>
                    <SelectItem value=&apos;inactive&apos;>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant=&apos;outline&apos;
              onClick={() => setIsEditWebhookDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveWebhookEdits}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Webhook Alert Dialog */}
      <AlertDialog
        open={isDeleteWebhookDialogOpen}
        onOpenChange={setIsDeleteWebhookDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the webhook{&apos; &apos;}
              <strong>{selectedWebhook?.name}</strong>. You will stop receiving
              events at this endpoint.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteWebhook}
              className=&apos;bg-destructive text-destructive-foreground hover:bg-destructive/90&apos;
            >
              Delete Webhook
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
