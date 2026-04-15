import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogActions,
  Divider,
  Checkbox,
  CircularProgress
} from '@mui/material';
import {
  Shield,
  Plus,
  PlusCircle,
  Eye,
  Pencil,
  Trash2,
  Search,
  X
} from 'lucide-react';
import { Tooltip } from '@mui/material';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import type { RoleForm } from '../types/Types';
import type { RoleData, PermissionActionState, Permission, PermissionCategory, ApiPermission } from '../types/Types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { roleSchema } from '../Yup/Schema';
import { useGetPermissionsQuery } from '../store/api/permissionApi';
import { useGetRolesQuery, useAddRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } from '../store/api/rolesApi';
import { toast } from 'react-toastify';
import {
  Users as UsersIcon,
  Mail,
  Building2,
  Clock,
  ShieldCheck,
  CreditCard,
  Layout,
  TrendingUp,
  Star
} from 'lucide-react';

const Roles: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: permissionsResponse, isLoading: permissionsLoading } = useGetPermissionsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: rolesResponse, isLoading: rolesLoading, refetch: refetchRoles } = useGetRolesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [addRole, { isLoading: isAddingRole }] = useAddRoleMutation();
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const [masterPermissions, setMasterPermissions] = useState<PermissionCategory[]>([]);

  const getIcon = (module: string) => {
    switch (module) {
      case 'Users': return <UsersIcon size={18} />;
      case 'Email Templates': return <Mail size={18} />;
      case 'Organization': return <Building2 size={18} />;
      case 'Audit': return <Clock size={18} />;
      case 'Roles & Permissions': return <ShieldCheck size={18} />;
      case 'Billing & Plans': return <CreditCard size={18} />;
      case 'Student Progress': return <TrendingUp size={18} />;
      case 'Content Management': return <Layout size={18} />;
      default: return <Star size={18} />;
    }
  };

  const transformApiPermissions = (apiPerms: ApiPermission[]): PermissionCategory[] => {
    const categories: Map<string, PermissionCategory> = new Map();
    apiPerms.forEach(apiPerm => {
      const catName = apiPerm.module;
      if (!categories.has(catName)) {
        categories.set(catName, {
          id: catName.toUpperCase().replace(/\s+/g, '_'),
          name: catName,
          permissions: []
        });
      }
      categories.get(catName)!.permissions.push({
        id: apiPerm.id,
        module: apiPerm.module,
        name: apiPerm.label,
        description: apiPerm.description,
        icon: getIcon(apiPerm.module),
        originalCategory: apiPerm.category,
        actions: {
          CREATE: apiPerm.canCreate,
          READ: apiPerm.canRead,
          UPDATE: apiPerm.canUpdate,
          DELETE: apiPerm.canDelete
        }
      });
    });
    return Array.from(categories.values());
  };

  const roles = React.useMemo(() => {
    if (!rolesResponse?.data) return [];
    return rolesResponse.data.map(apiRole => ({
      id: apiRole.id,
      name: apiRole.name,
      description: apiRole.description,
      categories: transformApiPermissions(apiRole.permissions)
    }));
  }, [rolesResponse, permissionsResponse]);

  React.useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0].id);
    }
  }, [roles, selectedRole]);

  React.useEffect(() => {
    if (permissionsResponse?.data) {
      setMasterPermissions(transformApiPermissions(permissionsResponse.data));
    }
  }, [permissionsResponse]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const [newRole, setNewRole] = useState({
    id: '',
    name: '',
    description: '',
    permissions: masterPermissions.map((cat: PermissionCategory) => ({
      ...cat,
      permissions: cat.permissions.map((perm: Permission) => ({
        ...perm,
        actions: { CREATE: false, READ: false, UPDATE: false, DELETE: false } as PermissionActionState
      }))
    }))
  });

  // Re-sync newRole permissions when masterPermissions is loaded
  React.useEffect(() => {
    if (masterPermissions.length > 0 && !isEditing && !isModalOpen) {
      setNewRole(prev => ({
        ...prev,
        permissions: masterPermissions.map((cat: PermissionCategory) => ({
          ...cat,
          permissions: cat.permissions.map((perm: Permission) => ({
            ...perm,
            actions: { CREATE: false, READ: false, UPDATE: false, DELETE: false } as PermissionActionState
          }))
        }))
      }));
    }
  }, [masterPermissions, isEditing, isModalOpen]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetRoleForm
  } = useForm<RoleForm>({
    resolver: yupResolver(roleSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  const handleToggle = (categoryId: string, permissionId: string, action: keyof PermissionActionState) => {
    if (isModalOpen) {
      setNewRole(prev => ({
        ...prev,
        permissions: prev.permissions.map((cat: PermissionCategory) => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            permissions: cat.permissions.map((perm: Permission) => {
              if (perm.id !== permissionId) return perm;
              return {
                ...perm,
                actions: { ...perm.actions, [action]: !perm.actions[action] }
              };
            })
          };
        })
      }));
    }
  };

  const handleToggleAllActions = (categoryId: string, permissionId: string, checked: boolean) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.map((cat: PermissionCategory) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          permissions: cat.permissions.map((perm: Permission) => {
            if (perm.id !== permissionId) return perm;

            // If checking, enable all supported actions from masterPermissions
            const masterCat = masterPermissions.find((c: PermissionCategory) => c.id === categoryId);
            const masterPerm = masterCat?.permissions.find((p: Permission) => p.id === permissionId);

            const newActions = { ...perm.actions };
            Object.keys(newActions).forEach(action => {
              const act = action as keyof PermissionActionState;
              newActions[act] = checked ? (masterPerm?.actions[act] || false) : false;
            });

            return { ...perm, actions: newActions };
          })
        };
      })
    }));
  };

  const handleDeleteRole = (roleId: string) => {
    setRoleToDelete(roleId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete).unwrap();
      if (selectedRole === roleToDelete) {
        setSelectedRole(roles.find(r => r.id !== roleToDelete)?.id || '');
      }
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
      toast.success('Role deleted successfully');
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error('Failed to delete role');
    }
  };

  const handleEditRole = (role: RoleData) => {
    setIsEditing(true);
    setEditingRoleId(role.id);

    setNewRole({
      id: role.id,
      name: role.name || '',
      description: role.description || '',
      permissions: masterPermissions.map(masterCat => ({
        ...masterCat,
        permissions: masterCat.permissions.map(masterPerm => {
          const rolePerm = role.categories
            .flatMap(c => c.permissions)
            .find(p => p.id === masterPerm.id);
          
          return {
            ...masterPerm,
            actions: rolePerm ? rolePerm.actions : { CREATE: false, READ: false, UPDATE: false, DELETE: false }
          };
        })
      }))
    });

    resetRoleForm({
      name: role.name || role.id.replace('ROLE_', '').replace(/_/g, ' '),
      description: role.description || ''
    });

    setIsModalOpen(true);
    setActiveStep(1); // Go straight to permissions as requested
  };

  // Modal Logic

  const currentRoleData = roles.find((r: RoleData) => r.id === selectedRole);

  const filteredCategories = currentRoleData?.categories.map((cat: PermissionCategory) => ({
    ...cat,
    permissions: cat.permissions.filter((p: Permission) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const hasActiveAction = Object.values(p.actions).some((val: any) => val);
      return matchesSearch && hasActiveAction;
    })
  })).filter((cat: any) => cat.permissions.length > 0) || [];

  const handleSaveRole = async () => {
    if (!newRole.name) return;

    try {
      const flatPermissions = newRole.permissions.flatMap((cat: PermissionCategory) =>
        cat.permissions
          .filter((perm: Permission) => Object.values(perm.actions).some(val => !!val))
          .map((perm: Permission) => ({
            id: perm.id
          }))
      );

      const permissionIds = flatPermissions.map(p => p.id);
      let roleName = newRole.name;
      if (!roleName.startsWith('ROLE_')) {
        roleName = `ROLE_${roleName.toUpperCase().replace(/\s+/g, '_')}`;
      }

      if (isEditing && editingRoleId) {
        const payload = {
          name: roleName,
          description: newRole.description,
          permissionIds: permissionIds
        };
        await updateRole({ id: editingRoleId, role: payload }).unwrap();
        refetchRoles();
        toast.success('Role updated successfully');
      } else {
        const payload = {
          name: roleName,
          description: newRole.description,
          permissionIds: permissionIds
        };
        const response = await addRole(payload).unwrap();
        refetchRoles();
        if (response?.data?.id) {
          setSelectedRole(response.data.id);
        }
        toast.success('Role created successfully');
      }

      setIsModalOpen(false);
      setActiveStep(0);
      setIsEditing(false);
      setEditingRoleId(null);
      setNewRole({
        id: '',
        name: '',
        description: '',
        permissions: masterPermissions.map((cat: PermissionCategory) => ({
          ...cat,
          permissions: cat.permissions.map((p: Permission) => ({
            ...p,
            actions: { CREATE: false, READ: false, UPDATE: false, DELETE: false }
          }))
        }))
      });
      resetRoleForm();
    } catch (error) {
      console.error('Failed to save role:', error);
    }
  };

  const getActionColor = (action: keyof PermissionActionState) => {
    switch (action) {
      case 'CREATE': return '#22C55E'; // Green
      case 'READ': return '#2463EB';   // Blue
      case 'UPDATE': return '#EA580C'; // Orange
      case 'DELETE': return '#EF4444'; // Red
      default: return '#64748B';
    }
  };

  const ACTION_ICONS = {
    CREATE: PlusCircle,
    READ: Eye,
    UPDATE: Pencil,
    DELETE: Trash2,
  };

  if (permissionsLoading || rolesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: 'calc(100vh - 80px)' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ color: '#2463EB' }}>
              <Shield size={24} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937', fontFamily: 'Outfit' }}>
              Access Control
            </Typography>
          </Box>
          <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 600, letterSpacing: '0.1em', ml: { xs: 0, md: 5 }, fontFamily: 'Outfit', }}>
            ROLES, PERMISSIONS & SECURITY POLICIES
          </Typography>
        </Box>
      </Box>

      {/* Role Tabs Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', mb: 3 }}>
        <Tabs
          value={selectedRole}
          onChange={(_, val) => setSelectedRole(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            flex: 1,
            mr: 2,
            '& .MuiTabs-indicator': { backgroundColor: '#2463EB', height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: { xs: '12px', md: '15px' },
              fontFamily: 'Outfit',
              color: '#64748B',
              minWidth: 120,
              pb: 2,
              '&.Mui-selected': { color: '#2463EB', fontWeight: 700 }
            }
          }}
        >
          {roles.map((role) => {
            const normalizedName = role.name?.toUpperCase() || '';
            const isProtected = ['ROLE_MANAGER', 'ROLE_TUTOR', 'ROLE_STUDENT', 'ROLE_LOGISTICS', 'MANAGER', 'TUTOR', 'STUDENT', 'LOGISTICS MANAGER', 'LOGISITICS MANGER'].some(
              protectedRole => normalizedName.includes(protectedRole)
            );
            return (
              <Tab
                key={role.id}
                value={role.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {role.name || role.id}
                    {!isProtected && (
                      <Box className="role-actions" sx={{ display: 'flex', opacity: selectedRole === role.id ? 1 : 0, transition: 'opacity 0.2s' }}>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleEditRole(role); }}
                          sx={{ p: 0.5, color: '#64748B', '&:hover': { color: '#2463EB', backgroundColor: '#F0F9FF' } }}
                        >
                          <Pencil size={14} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }}
                          sx={{ p: 0.5, color: '#64748B', '&:hover': { color: '#EF4444', backgroundColor: '#FEF2F2' } }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                }
                sx={{
                  '&:hover .role-actions': { opacity: 1 }
                }}
              />
            );
          })}
        </Tabs>
        <Button
          variant="outlined"
          startIcon={<Plus size={18} />}
          onClick={() => {
            setIsEditing(false);
            setEditingRoleId(null);
            setIsModalOpen(true);
            setActiveStep(0);
          }}
          sx={{
            textTransform: 'none',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: { xs: '12px', md: '16px' },
            mb: 1.5,
            borderColor: '#E2E8F0',
            color: '#2463EB',
            '&:hover': { backgroundColor: '#F0F9FF', borderColor: '#2463EB' }
          }}
        >
          New Role
        </Button>
      </Box>

      <Box sx={{ mb: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '16px', color: '#1F2937', bgcolor: "white", p: 2, borderRadius: '10px', width: 'fit-content', border: '1px solid #E2E8F0', mb: 0 }}>
          Permission To {currentRoleData?.name || ''}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: { xs: 1, md: 0 }, minWidth: { md: '350px' } }}>
          <Input
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            sx={{ mb: 0 }}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: '#94A3B8', display: 'flex' }}>
                  <Search size={18} />
                </Box>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Permissions Content Area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filteredCategories && filteredCategories.length > 0 ? (
          filteredCategories.map((category: any) => (
            <Box key={category.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ width: 4, height: 24, backgroundColor: '#2463EB', borderRadius: '4px', mr: 1.5 }} />
                <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '16px', letterSpacing: '0.02em', fontFamily: 'Outfit' }}>
                  {category.name.toUpperCase()}
                </Typography>
              </Box>

              <Box sx={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                {category.permissions.map((perm: Permission, idx: number) => (
                  <Box
                    key={perm.id}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 3,
                      py: 2.5,
                      borderBottom: idx === category.permissions.length - 1 ? 'none' : '1px solid #F1F5F9',
                      transition: 'all 0.2s',
                      '&:hover': { backgroundColor: '#F8F9FA' }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2.5, flex: 1 }}>
                      <Box sx={{ p: 1, borderRadius: '50%', backgroundColor: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {perm.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '14px', mb: 0.25 }}>{perm.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '12px' }}>{perm.description}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      {(['CREATE', 'READ', 'UPDATE', 'DELETE'] as const).map((action) => {
                        const Icon = ACTION_ICONS[action];
                        const isActive = perm.actions[action];

                        const masterCat = masterPermissions.find((c: PermissionCategory) => c.id === category.id);
                        const masterPerm = masterCat?.permissions.find((p: Permission) => p.id === perm.id);
                        const isSupported = masterPerm?.actions[action];

                        return (
                          <Tooltip key={action} title={isSupported ? action.charAt(0) + action.slice(1).toLowerCase() : `Not supported for ${perm.name}`} arrow>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => isSupported && handleToggle(category.id, perm.id, action)}
                                sx={{
                                  p: 0.5,
                                  color: isSupported ? getActionColor(action) : '#E2E8F0',
                                  opacity: isSupported ? (isActive ? 1 : 0.6) : 0.45,
                                  cursor: isSupported ? 'pointer' : 'default',
                                  '&:hover': isSupported ? {
                                    backgroundColor: `${getActionColor(action)}10`,
                                    opacity: 1
                                  } : {}
                                }}
                              >
                                <Icon size={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))
        ) : (
          <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#94A3B8' }}>
            <Search size={48} strokeWidth={1.5} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569', mb: 0.5 }}>No results found</Typography>
              <Typography variant="body2">We couldn't find any permissions matching "{searchQuery}"</Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Stepper Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', minHeight: { xs: '90vh', sm: 'auto' }, m: { xs: 1, sm: 2 } } }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Outfit' }}>
            {isEditing ? 'Edit Role' : 'Create New Role'}
          </Typography>
          <IconButton onClick={() => setIsModalOpen(false)} size="small"><X size={20} /></IconButton>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 4 }, pb: 0 }}>
          {/* Custom Stepper */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, position: 'relative' }}>
            {/* Line connector */}
            <Box sx={{ position: 'absolute', width: '40%', height: '2px', backgroundColor: '#E2E8F0', zIndex: 0 }} />

            <Box sx={{ zIndex: 1, display: 'flex', gap: { xs: 5, sm: 10 } }}>
              {['Identity', 'Permissions'].map((label, idx) => (
                <Box key={label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: activeStep >= idx ? '#2463EB' : '#E2E8F0',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    border: activeStep === idx ? '4px solid #F0F9FF' : 'none'
                  }}>
                    {idx + 1}
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '12px', color: activeStep >= idx ? '#2463EB' : '#94A3B8' }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{
          px: { xs: 2, sm: 4 },
          py: 2,
          overflowY: 'auto',
          maxHeight: { xs: 'calc(90vh - 250px)', sm: '500px' }
        }}>
          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Input
                label="Role Name"
                placeholder="e.g. Content Moderator"
                {...register('name')}
                onChange={(e) => {
                  register('name').onChange(e);
                  setNewRole({ ...newRole, name: e.target.value });
                }}
                errorText={errors.name?.message}
              />
              <Input
                label="Description"
                placeholder="Briefly describe the purpose of this role..."
                multiline
                rows={3}
                {...register('description')}
                onChange={(e) => {
                  register('description').onChange(e);
                  setNewRole({ ...newRole, description: e.target.value });
                }}
                errorText={errors.description?.message}
              />
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B', mb: 2 }}>Select Permissions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {masterPermissions.map((category: PermissionCategory) => (
                  <Box key={category.id}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>
                      {category.name.toUpperCase()}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {category.permissions.map((perm: Permission) => (
                        <Box
                          key={perm.id}
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            borderRadius: '12px',
                            border: '1px solid #F1F5F9',
                            backgroundColor: '#F8FAFC'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                            <Checkbox
                              size="small"
                              checked={Object.values(newRole.permissions.find((c: PermissionCategory) => c.id === category.id)?.permissions.find((p: Permission) => p.id === perm.id)?.actions || {}).some((val: any) => val)}
                              onChange={(e) => handleToggleAllActions(category.id, perm.id, e.target.checked)}
                              sx={{ color: '#E2E8F0', '&.Mui-checked': { color: '#2463EB' } }}
                            />
                            <Box>
                              <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '13px' }}>{perm.name}</Typography>
                              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, display: 'block', lineHeight: 1.2 }}>{perm.description}</Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {(['CREATE', 'READ', 'UPDATE', 'DELETE'] as const).map((action) => {
                              const Icon = ACTION_ICONS[action];
                              const roleCat = newRole.permissions.find((c: PermissionCategory) => c.id === category.id);
                              const rolePerm = roleCat?.permissions.find((p: Permission) => p.id === perm.id);
                              const isPermActive = rolePerm?.actions[action];
                              const masterCat = masterPermissions.find((c: PermissionCategory) => c.id === category.id);
                              const masterPerm = masterCat?.permissions.find((p: Permission) => p.id === perm.id);
                              const isSupported = masterPerm?.actions[action];

                              return (
                                <Tooltip key={action} title={isSupported ? action.charAt(0) + action.slice(1).toLowerCase() : `Not supported for ${perm.name}`} arrow>
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={() => isSupported && handleToggle(category.id, perm.id, action)}
                                      sx={{
                                        p: 0.5,
                                        color: isSupported ? getActionColor(action) : '#E2E8F0',
                                        opacity: isSupported ? (isPermActive ? 1 : 0.6) : 0.45,
                                        cursor: isSupported ? 'pointer' : 'default',
                                        '&:hover': isSupported ? {
                                          backgroundColor: `${getActionColor(action)}10`,
                                          opacity: 1
                                        } : {}
                                      }}
                                    >
                                      <Icon size={16} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              );
                            })}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Divider />
        <DialogActions sx={{ px: 4, py: 3, gap: 1.5, justifyContent: 'space-between' }}>
          {activeStep === 0 ? (
            <Button variant="outlined" onClick={() => setIsModalOpen(false)} sx={{ flex: 1, textTransform: 'none' }}>
              Cancel
            </Button>
          ) : (
            <Button variant="outlined" onClick={() => setActiveStep(0)} sx={{ flex: 1, textTransform: 'none' }}>
              Back
            </Button>
          )}

          <Button
            variant="contained"
            onClick={activeStep === 0 ? handleSubmit(() => setActiveStep(1)) : handleSaveRole}
            sx={{ flex: 1, textTransform: 'none', backgroundColor: '#2463EB', '&:hover': { backgroundColor: '#1D4ED8' } }}
          >
            {activeStep === 0 ? 'Next' : (isAddingRole || isUpdatingRole ? 'Saving...' : (isEditing ? 'Update' : 'Save Role'))}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        PaperProps={{ sx: { borderRadius: '16px', width: '400px', p: 1 } }}
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Box sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            backgroundColor: '#FEF2F2',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Trash2 size={24} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Outfit' }}>
            Delete Role?
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '14px', mb: 3 }}>
            Are you sure you want to delete the role <strong>{roleToDelete}</strong>? This action cannot be undone.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setIsDeleteModalOpen(false)}
              sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 600, borderColor: '#E2E8F0', color: '#64748B' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={confirmDeleteRole}
              sx={{
                textTransform: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                backgroundColor: '#EF4444',
                '&:hover': { backgroundColor: '#DC2626' }
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box >
  );
};

export default Roles;
