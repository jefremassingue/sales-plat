import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Plus, Search, Filter } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { can } from '@/lib/utils';

interface BreadcrumbItem {
    title: string;
    href: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'System Settings',
        href: '/settings/system',
    },
];

interface Setting {
    id: string;
    group: string;
    key: string;
    value: string | null;
    description: string | null;
    type: 'text' | 'number' | 'boolean' | 'email' | 'url' | 'textarea';
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

interface SystemSettingsProps {
    settings: Record<string, Setting[]>;
    groups: string[];
    filters: {
        search?: string;
        group?: string;
    };
}

export default function SystemSettings({ settings, groups = [], filters = {} }: SystemSettingsProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedGroup, setSelectedGroup] = useState(filters.group || 'all');

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, reset: createReset } = useForm({
        group: '',
        key: '',
        value: '',
        description: '',
        type: 'text',
        is_public: false,
    });

    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, reset: editReset } = useForm({
        group: '',
        key: '',
        value: '',
        description: '',
        type: '',
        is_public: null as boolean | null,
    });

    const { delete: deleteSetting, processing: deleteProcessing } = useForm();

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createPost(route('settings.store'), {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                createReset();
            },
        });
    };

    const handleEdit = (setting: Setting) => {
        setSelectedSetting(setting);
        editReset();
        setEditData(data => ({
            ...data,
            group: setting.group,
            key: setting.key,
            value: setting.value || '',
            description: setting.description || '',
            type: setting.type,
            is_public: setting.is_public,
        }));
        setIsEditDialogOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSetting) return;

        editPut(route('settings.update', selectedSetting.id), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setSelectedSetting(null);
                editReset();
            },
        });
    };

    const handleDelete = (setting: Setting) => {
        if (confirm('Are you sure you want to delete this setting?')) {
            deleteSetting(route('settings.destroy', setting.id));
        }
    };

    const renderSettingValue = (setting: Setting) => {
        switch (setting.type) {
            case 'boolean':
                return (
                    <Badge variant={setting.value === 'true' ? 'default' : 'secondary'}>
                        {setting.value === 'true' ? 'True' : 'False'}
                    </Badge>
                );
            case 'textarea':
                return (
                    <div className=" line-clamp-1 text-sm text-muted-foreground">
                        {setting.value || 'No value'}
                    </div>
                );
            default:
                return setting.value || <span className="text-muted-foreground">No value</span>;
        }
    };

    const SettingFormFields = ({ 
        data, 
        setData, 
        type 
    }: { 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any; 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setData: any; 
        type: 'create' | 'edit';
    }) => (
        <>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor={`${type}-group`}>Group</Label>
                    <Input
                        id={`${type}-group`}
                        value={data.group}
                        onChange={(e) => setData('group', e.target.value)}
                        placeholder="e.g., company, email, general"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`${type}-key`}>Key</Label>
                    <Input
                        id={`${type}-key`}
                        value={data.key}
                        onChange={(e) => setData('key', e.target.value)}
                        placeholder="e.g., name, logo_url, theme"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`${type}-type`}>Type</Label>
                    <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="url">URL</SelectItem>
                            <SelectItem value="textarea">Textarea</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`${type}-value`}>Value</Label>
                    {data.type === 'textarea' ? (
                        <Textarea
                            id={`${type}-value`}
                            value={data.value}
                            onChange={(e) => setData('value', e.target.value)}
                            placeholder="Enter value..."
                            rows={3}
                        />
                    ) : data.type === 'boolean' ? (
                        <Select value={data.value} onValueChange={(value) => setData('value', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">True</SelectItem>
                                <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input
                            id={`${type}-value`}
                            type={data.type === 'number' ? 'number' : data.type === 'email' ? 'email' : data.type === 'url' ? 'url' : 'text'}
                            value={data.value}
                            onChange={(e) => setData('value', e.target.value)}
                            placeholder="Enter value..."
                        />
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`${type}-description`}>Description</Label>
                    <Textarea
                        id={`${type}-description`}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Optional description..."
                        rows={2}
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id={`${type}-is-public`}
                        checked={data.is_public}
                        onCheckedChange={(checked) => setData('is_public', checked)}
                    />
                    <Label htmlFor={`${type}-is-public`}>Public Setting</Label>
                </div>
            </div>
        </>
    );

    // Collapse state for each group
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        Object.keys(settings).forEach((group) => {
            initial[group] = false; // default: expanded
        });
        return initial;
    });

    const toggleGroup = (group: string) => {
        setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall 
                            title="System Settings" 
                            description="Manage application configuration settings" 
                        />
                        
                        {can('settings.create') && (
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Setting
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Create New Setting</DialogTitle>
                                        <DialogDescription>
                                            Add a new configuration setting to the system.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreate}>
                                        <SettingFormFields data={createData} setData={setCreateData} type="create" />
                                        <DialogFooter className="mt-6">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsCreateDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={createProcessing}>
                                                {createProcessing ? 'Creating...' : 'Create Setting'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    {/* Search and Filter */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search settings..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                <div className="sm:w-[200px]">
                                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Groups</SelectItem>
                                            {groups.map((group) => (
                                                <SelectItem key={group} value={group} className="capitalize">
                                                    {group}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const params = new URLSearchParams();
                                        if (searchTerm) params.set('search', searchTerm);
                                        if (selectedGroup && selectedGroup !== 'all') params.set('group', selectedGroup);
                                        
                                        window.location.href = `/settings/system?${params.toString()}`;
                                    }}
                                >
                                    <Filter className="mr-2 h-4 w-4" />
                                    Apply Filters
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedGroup('all');
                                        window.location.href = '/settings/system';
                                    }}
                                >
                                    Clear
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {Object.keys(settings).length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <h3 className="text-lg font-medium">No settings found</h3>
                                    <p className="text-muted-foreground">Create your first setting to get started.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(settings).map(([group, groupSettings]) => {
                                const isOpen = openGroups[group];
                                return (
                                    <Card key={group}>
                                        <CardHeader className="flex flex-row items-center justify-between cursor-pointer select-none" onClick={() => toggleGroup(group)}>
                                            <div>
                                                <CardTitle className="capitalize flex items-center gap-2">
                                                    {group}
                                                    <span className="text-xs text-muted-foreground">({groupSettings.length} setting{groupSettings.length !== 1 ? 's' : ''})</span>
                                                </CardTitle>
                                            </div>
                                            <Button variant="ghost" size="icon" tabIndex={-1} aria-label={isOpen ? 'Collapse' : 'Expand'}>
                                                {isOpen ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 6L12 10L8 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                            </Button>
                                        </CardHeader>
                                        {isOpen && (
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {groupSettings.map((setting, index) => (
                                                        <div key={setting.id}>
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1 space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-medium">{setting.key}</h4>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {setting.type}
                                                                        </Badge>
                                                                        {setting.is_public && (
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                Public
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm">
                                                                        {renderSettingValue(setting)}
                                                                    </div>
                                                                    {setting.description && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {setting.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {can('settings.edit') && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleEdit(setting)}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                    {can('settings.destroy') && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleDelete(setting)}
                                                                            disabled={deleteProcessing}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {index < groupSettings.length - 1 && (
                                                                <Separator className="mt-4" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Edit Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Edit Setting</DialogTitle>
                                <DialogDescription>
                                    Update the configuration setting.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpdate}>
                                <SettingFormFields data={editData} setData={setEditData} type="edit" />
                                <DialogFooter className="mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditDialogOpen(false);
                                            setSelectedSetting(null);
                                            editReset();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={editProcessing}>
                                        {editProcessing ? 'Updating...' : 'Update Setting'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
