import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Popover,
  MenuItem,
  Switch,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
  Tabs,
  Tab,
  Checkbox,
  Select,
} from '@mui/material';
import {
  Users as UsersIcon,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  UploadCloud,
  Download,
  Info,
  ChevronDown,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import type { User } from '../types/Types';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { inviteUserSchema } from '../Yup/Schema';
import type { InviteUserForm } from '../types/Types';
import {
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUploadUsersMutation
} from '../store/api/userApi';
import { useGetRolesQuery } from '../store/api/rolesApi';
import { toast } from 'react-toastify';

// Removed mockUsers

const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const { data: usersData, isLoading, refetch } = useGetUsersQuery({ page: currentPage, size: 10 }, { refetchOnMountOrArgChange: true });
  const onlineUsers = useSelector((state: RootState) => state.onlineStatus.onlineUsers);
  const [addUser, { isLoading: isAddingUser }] = useAddUserMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [uploadUsers, { isLoading: isUploadingUsers }] = useUploadUsersMutation();
  const { data: rolesData } = useGetRolesQuery(undefined, { refetchOnMountOrArgChange: true });
  const { authStorage } = useAuth();
  const organisationId = authStorage?.data?.organisation?.id || '';

  const [editUser, setEditUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteTab, setInviteTab] = useState(0);
  const [nrolConnectSelected, setNrolConnectSelected] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<InviteUserForm>({
    resolver: yupResolver(inviteUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: ''
    }
  });

  const onInviteSubmit = async (data: InviteUserForm) => {
    try {
      const payload = {
        name: data.fullName,
        email: data.email,
        mobileNumber: data.phone,
        active: true, // Required by backend to prevent 400
        organisationId: organisationId,
        productIds: ["69aa86931f72d25f218e4821"], // UUID from your screenshot
        roleIds: [data.role] // data.role is already the ID from the Select
      };
      await addUser(payload).unwrap();
      refetch();
      setIsInviteModalOpen(false);
      reset();
      toast.success('User invited successfully');
    } catch (error) {
      console.error('Invite failed:', error);
      toast.error('Failed to invite user');
    }
  };

  const handleBulkUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('productIds', "69aa86931f72d25f218e4821"); // UUID from your screenshot
      try {
        await uploadUsers(formData).unwrap();
        setIsInviteModalOpen(false);
        setSelectedFile(null);
        toast.success('Users uploaded successfully');
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error('Failed to upload users');
      }
    } else {
      setIsInviteModalOpen(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('Selected file:', file.name);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const totalPages = usersData?.data?.page?.totalPages || 0;

  const [roleAnchorEl, setRoleAnchorEl] = useState<{ el: HTMLElement; userId: string } | null>(null);

  const filteredUsers = React.useMemo(() => {
    const rawUsers = usersData?.data?.content || [];
    return rawUsers.filter((user) =>
      Object.values(user).some((value) =>
        typeof value === 'string' && value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [usersData, searchQuery]);

  // Pagination Logic matching AuditLog implementation
  const getPageNumbers = () => {
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, start + 4);

    if (end === totalPages - 1) {
      start = Math.max(0, totalPages - 5);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      if (i >= 0) pages.push(i);
    }
    return pages;
  };

  const handleRoleClick = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setRoleAnchorEl({ el: event.currentTarget, userId });
  };

  const handleRoleClose = () => {
    setRoleAnchorEl(null);
  };

  const handleRoleChange = async (roleId: string) => {
    if (roleAnchorEl) {
      const rawUsers = usersData?.data?.content || [];
      const userToUpdate = rawUsers.find(u => u.id === roleAnchorEl.userId);
      if (userToUpdate) {
        try {
          const payload = {
            name: userToUpdate.name,
            email: userToUpdate.email,
            mobileNumber: userToUpdate.mobileNumber,
            active: userToUpdate.active,
            productIds: ["69aa86931f72d25f218e4821"], // UUID from your screenshot
            roleIds: [roleId]
          };
          await updateUser({ id: userToUpdate.id, user: payload }).unwrap();
          refetch();
          toast.success('Role updated successfully');
        } catch (error) {
          console.error('Failed to update role:', error);
          toast.error('Failed to update role');
        }
      }
      handleRoleClose();
    }
  };

  const handleEditClick = (user: User) => {
    setEditUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editUser) {
      try {
        const payload = {
          name: editUser.name,
          email: editUser.email,
          mobileNumber: editUser.mobileNumber,
          active: editUser.active,
          productIds: ["69aa86931f72d25f218e4821"], // UUID from your screenshot
          roleIds: editUser.roles && editUser.roles.length > 0 ? [editUser.roles[0].id] : []
        };
        await updateUser({ id: editUser.id, user: payload }).unwrap();
        refetch();
        setIsEditModalOpen(false);
        toast.success('User updated successfully');
      } catch (error) {
        console.error('Update failed:', error);
        toast.error('Failed to update user');
      }
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id).unwrap();
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Delete failed:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const getRoleTheme = (roleName: string = '') => {
    switch (roleName) {
      case 'ROLE_MANAGER': return { color: '#7C3AED', bg: '#F5F3FF', dot: '#7C3AED' };
      case 'ROLE_STUDENT': return { color: '#0D9488', bg: '#F0FDFA', dot: '#0D9488' };
      case 'ROLE_TUTOR': return { color: '#EA580C', bg: '#FFF7ED', dot: '#EA580C' };
      default: return { color: '#6B7280', bg: '#F9FAFB', dot: '#6B7280' };
    }
  };

  const gridTemplate = { xs: '1fr', md: '3.5fr 1.5fr 1.5fr 1fr' };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: 'calc(100vh - 80px)' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ color: '#2463EB' }}>
              <UsersIcon size={24} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937' }}>
              User Management
            </Typography>
          </Box>
          <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 600, letterSpacing: '0.1em', ml: { xs: 0, md: 5 } }}>
            TEAM & ROLES
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: 2, flexGrow: { xs: 1, md: 0 }, minWidth: { md: '450px' }, width: { xs: '100%', sm: 'auto' } }}>
          <Input
            placeholder="Search by Name, Email or Phone"
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
          <Button
            variant="contained"
            startIcon={<UserPlus size={18} />}
            onClick={() => setIsInviteModalOpen(true)}
            sx={{
              backgroundColor: '#2463EB',
              '&:hover': { backgroundColor: '#1E40AF' },
              borderRadius: '8px',
              width: { xs: '100%', sm: 'auto' },
              px: { xs: 2, sm: 3, md: 4 },
              height: '48px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '14px',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 6px -1px rgba(36, 99, 235, 0.1), 0 2px 4px -1px rgba(36, 99, 235, 0.06)',
            }}
          >
            Invite Users
          </Button>
        </Box>
      </Box>

      <Dialog
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px', overflow: 'hidden' }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Outfit' }}>Invite Users</Typography>
          <IconButton onClick={() => setIsInviteModalOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={inviteTab}
            onChange={(_, newValue) => setInviteTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '14px',
                minWidth: 'auto',
                px: 3,
                color: '#64748B',
              },
              '& .Mui-selected': { color: '#2463EB !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#2463EB', height: '3px', borderRadius: '3px 3px 0 0' }
            }}
          >
            <Tab label="Invite" />
            <Tab label="Bulk Upload (.xlsx)" />
          </Tabs>
        </Box>

        <DialogContent sx={{ p: 4 }}>
          {inviteTab === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Input
                label="Full Name"
                placeholder="Enter full name"
                fullWidth
                hideLabel={false}
                {...register('fullName')}
                errorText={errors.fullName?.message}
              />
              <Input
                label="Email Address"
                placeholder="Enter email address"
                fullWidth
                hideLabel={false}
                {...register('email')}
                errorText={errors.email?.message}
              />
              <Input
                label="Mobile Number"
                placeholder="Enter mobile number"
                fullWidth
                hideLabel={false}
                {...register('phone')}
                errorText={errors.phone?.message}
              />

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#1F2937' }}>Role</Typography>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <Select
                        {...field}
                        fullWidth
                        displayEmpty
                        error={!!errors.role}
                        sx={{
                          borderRadius: '10px',
                          height: '45px',
                          backgroundColor: '#fff',
                          fontSize: '14px',
                          fontWeight: 600,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: errors.role ? '#d32f2f' : '#E2E8F0' }
                        }}
                      >
                        <MenuItem value="" disabled>Select Role</MenuItem>
                        {rolesData?.data?.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name.replace('ROLE_', '')}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.role && (
                        <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, ml: 1.5, display: 'block' }}>
                          {errors.role.message}
                        </Typography>
                      )}
                    </Box>
                  )}
                />
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <Box
                component="input"
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                aria-label="Bulk Upload Excel File"
                sx={{ display: 'none' }}
              />
              <Box
                sx={{
                  width: '100%',
                  position: 'relative'
                }}
              >
                <Box
                  onClick={triggerFileUpload}
                  sx={{
                    width: '100%',
                    py: 6,
                    border: '2px dashed #E2E8F0',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    backgroundColor: selectedFile ? '#F0F9FF' : 'transparent',
                    borderColor: selectedFile ? '#3B82F6' : '#E2E8F0',
                    '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' },
                    transition: 'all 0.2s'
                  }}
                >
                  <Box sx={{ p: 2, backgroundColor: selectedFile ? '#3B82F6' : '#EFF6FF', borderRadius: '50%', color: selectedFile ? '#fff' : '#2463EB' }}>
                    <UploadCloud size={32} />
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    {selectedFile ? selectedFile.name : 'Click to upload Excel file'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'Support for .xlsx, .xls'}
                  </Typography>
                </Box>
                {selectedFile && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      '&:hover': { backgroundColor: '#F1F5F9' }
                    }}
                  >
                    <X size={16} />
                  </IconButton>
                )}
              </Box>



              <Box sx={{ width: '100%', p: 2, backgroundColor: '#F8FAFC', borderRadius: '12px', display: 'flex', gap: 1.5 }}>
                <Info size={18} color="#2463EB" style={{ marginTop: 2 }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, lineHeight: 1.5 }}>
                  The Excel file should contain <Box component="span" sx={{ fontWeight: 700, color: '#1E293B' }}>Name, Email & Role</Box> columns.
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}>
              Select Licensed Products
            </Typography>
            <Box
              sx={{
                p: 2,
                backgroundColor: '#F1F5F9',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #E2E8F0'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#2463EB', fontSize: '14px', fontWeight: 800 }}>N</Avatar>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>Nrol connect</Typography>
              </Box>
              <Checkbox
                checked={nrolConnectSelected}
                onChange={(e) => setNrolConnectSelected(e.target.checked)}
                sx={{
                  color: '#CBD5E1',
                  '&.Mui-checked': { color: '#2463EB' }
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setIsInviteModalOpen(false)}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: '12px',
              backgroundColor: '#F1F5F9',
              color: '#64748B',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#E2E8F0' },
              fontSize: { xs: '12px', md: '16px' }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={inviteTab === 0 ? handleSubmit(onInviteSubmit) : handleBulkUpload}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              backgroundColor: '#2463EB',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: { xs: '12px', md: '16px' },
              '&:hover': { backgroundColor: '#1E40AF' }
            }}
          >
            {inviteTab === 0
              ? (isAddingUser ? 'Inviting...' : 'Invite User')
              : (isUploadingUsers ? 'Uploading...' : 'Upload')}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
        <Box
          sx={{
            display: { xs: 'none', md: 'grid' },
            gridTemplateColumns: gridTemplate,
            px: 4,
            py: 2.5,
            backgroundColor: '#F0F7FF',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          {['Heading', 'User Roll', 'Status'].map((head) => (
            <Typography key={head} variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.05em', ml: 2, }}>
              {head.toUpperCase()}
            </Typography>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'center', pr: 2 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>
              ACTION
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : 'N/A';
              const theme = getRoleTheme(userRole);
              return (
                <Box
                  key={user.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: gridTemplate,
                    alignItems: 'center',
                    px: 4,
                    py: 3,
                    backgroundColor: '#F9FAFB',
                    '&:hover': { backgroundColor: '#f8f1f9ff' },
                    borderBottom: '1px solid #E2E8F0',
                    gap: { xs: 2, md: 0 },
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        background: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)',
                        color: '#475569',
                        fontWeight: 700,
                        fontSize: '15px',
                      }}
                      src={user.profilePicture || undefined}
                    >
                      {user.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '15px' }}>{user.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '12px' }}>
                        {user.email} | {user.mobileNumber}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      onClick={(e) => handleRoleClick(e, user.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 0.75,
                        borderRadius: '99px',
                        backgroundColor: theme.bg,
                        color: theme.color,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 },
                      }}
                    >
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: theme.dot }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '12px' }}>
                        {userRole.replace('ROLE_', '')}
                      </Typography>
                      <ChevronDown size={14} style={{ opacity: 0.6 }} />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 0.75,
                        borderRadius: '99px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#fff',
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: onlineUsers[user.id] ? '#10B981' : '#94A3B8',
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', fontSize: '12px' }}>
                        {onlineUsers[user.id] ? 'Online' : 'Offline'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-end', md: 'center' }, alignItems: 'center', gap: 1, pr: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(user)}
                      sx={{ color: '#64748B', '&:hover': { color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' } }}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(user)}
                      sx={{ color: '#64748B', '&:hover': { color: '#2463EB', backgroundColor: 'rgba(36, 99, 235, 0.05)' } }}
                    >
                      <Pencil size={18} />
                    </IconButton>
                  </Box>
                </Box>
              );
            })
          ) : (
            <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#94A3B8' }}>
              <Search size={48} strokeWidth={1.5} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569', mb: 0.5 }}>No user found</Typography>
                <Typography variant="body2">We couldn't find any user matching "{searchQuery}"</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'end', alignItems: 'center', gap: 1.5 }}>
        <IconButton
          size="small"
          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
          sx={{
            width: 40,
            height: 40,
            border: '1px solid #E2E8F0',
            color: '#64748B',
            '&:hover': { backgroundColor: '#F1F5F9' },
            '&.Mui-disabled': { opacity: 0.3 }
          }}
        >
          <ChevronLeft size={18} />
        </IconButton>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {getPageNumbers().map((page) => (
            <Box
              key={page}
              onClick={() => setCurrentPage(page)}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: currentPage === page ? '#3B82F6' : 'transparent',
                border: currentPage === page ? 'none' : '1px solid #E2E8F0',
                color: currentPage === page ? '#fff' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: currentPage === page ? 600 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': currentPage !== page ? { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' } : {}
              }}
            >
              {page + 1}
            </Box>
          ))}
        </Box>

        <IconButton
          size="small"
          onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
          disabled={currentPage >= totalPages - 1}
          sx={{
            width: 40,
            height: 40,
            border: '1px solid #E2E8F0',
            color: '#64748B',
            '&:hover': { backgroundColor: '#F1F5F9' },
            '&.Mui-disabled': { opacity: 0.3 }
          }}
        >
          <ChevronRight size={18} />
        </IconButton>
      </Box>

      <Popover
        open={Boolean(roleAnchorEl)}
        anchorEl={roleAnchorEl?.el}
        onClose={handleRoleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{
          sx: { mt: 1, p: 1, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
        }}
      >
        {rolesData?.data?.map((role) => {
          const roleName = role.name;
          const theme = getRoleTheme(roleName);
          return (
            <MenuItem
              key={role.id}
              onClick={() => handleRoleChange(role.id)}
              sx={{ borderRadius: '8px', px: 2, py: 1, gap: 1.5 }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.dot }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>{roleName.replace('ROLE_', '')}</Typography>
            </MenuItem>
          );
        })}
      </Popover>

      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px', p: 0, overflow: 'hidden' }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit User</Typography>
          <IconButton onClick={() => setIsEditModalOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </Box>
        <Divider />
        <DialogContent sx={{ px: 4, py: 3 }}>
          {editUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    width: 70,
                    height: 70,
                    background: 'linear-gradient(135deg, #2463EB 0%, #1E40AF 100%)',
                    mb: 1.5,
                    fontSize: '24px',
                    fontWeight: 700,
                  }}
                >
                  {editUser.name.charAt(0)}
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>{editUser.name}</Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2.5,
                  alignItems: 'start'
                }}
              >
                <Input
                  label="Full Name"
                  value={editUser.name}
                  placeholder="Enter full name"
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  sx={{ mb: 0 }}
                />
                <Input
                  label="Email Address"
                  value={editUser.email}
                  placeholder="Enter email address"
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  sx={{ mb: 0 }}
                />
                <Input
                  label="Mobile Number"
                  value={editUser.mobileNumber}
                  placeholder="Enter mobile number"
                  onChange={(e) => setEditUser({ ...editUser, mobileNumber: e.target.value })}
                  sx={{ mb: 0 }}
                />


                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, color: '#1F2937' }}>Account Status</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      height: '48px',
                      px: 2,
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: editUser.active ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                      {editUser.active ? 'Active' : 'Inactive'}
                    </Typography>
                    <Switch
                      checked={editUser.active}
                      onChange={(e) => setEditUser({ ...editUser, active: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#10B981' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10B981' }
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, color: '#1F2937' }}>Role</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {rolesData?.data?.map((role) => {
                      const isActive = editUser.roles && editUser.roles.length > 0 && editUser.roles[0].id === role.id;
                      return (
                        <Button
                          key={role.id}
                          variant={isActive ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => setEditUser({
                            ...editUser,
                            roles: [{ ...editUser.roles[0], id: role.id, name: role.name }]
                          })}
                          sx={{
                            height: '45px',
                            minWidth: '100px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: 700,
                            backgroundColor: isActive ? '#2463EB' : 'transparent',
                            color: isActive ? '#fff' : '#64748B',
                            borderColor: isActive ? 'transparent' : '#E2E8F0',
                            '&:hover': {
                              backgroundColor: isActive ? '#1E40AF' : '#F8FAFC',
                            }
                          }}
                        >
                          {role.name.replace('ROLE_', '')}
                        </Button>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}>
                  Select Licensed Products
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: '#F1F5F9',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#2463EB', fontSize: '14px', fontWeight: 800 }}>N</Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>Nrol connect</Typography>
                  </Box>
                  <Checkbox
                    checked={nrolConnectSelected}
                    onChange={(e) => setNrolConnectSelected(e.target.checked)}
                    sx={{
                      color: '#CBD5E1',
                      '&.Mui-checked': { color: '#2463EB' }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
          <Button variant="outlined" onClick={() => setIsEditModalOpen(false)} sx={{ px: 3, fontSize: { xs: '12px', md: '16px' } }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveEdit} sx={{ px: 3, fontSize: { xs: '12px', md: '16px' } }}>
            {isUpdatingUser ? 'Saving...' : 'Update Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px', p: 0, overflow: 'hidden' }
        }}
      >
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              color: '#EF4444'
            }}
          >
            <AlertTriangle size={28} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1E293B' }}>
            Delete User
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', px: 2, fontSize: { xs: '12px', md: '16px' } }}>
            Are you sure you want to delete <b>{userToDelete?.name}</b>? This action cannot be undone and all data associated with this user will be removed.
          </Typography>
        </Box>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
          <Button variant="outlined" onClick={() => setIsDeleteModalOpen(false)} sx={{ px: 3, flex: 1, fontSize: { xs: '12px', md: '16px' } }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteConfirm}
            sx={{
              px: 3,
              flex: 1,
              backgroundColor: '#EF4444',
              fontSize: { xs: '12px', md: '16px' },
              '&:hover': { backgroundColor: '#DC2626' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
