import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Divider,
  Switch,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  Pencil,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { profileSchema, passwordSchema } from '../Yup/Schema';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useGetProfileQuery, useUpdateProfileMutation } from '../store/api/profileApi';
import { toast } from 'react-toastify';
import type { ProfileFormData } from '../types/Types';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: profileResponse, isLoading: isProfileLoading } = useGetProfileQuery(undefined, {
    refetchOnMountOrArgChange: true
  });
  const [updateProfile] = useUpdateProfileMutation();
  const user = profileResponse?.data;

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(true);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    watch: watchProfile,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      mobileNumber: ''
    }
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        fullName: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber || ''
      });
      setMfaEnabled(user.mfaEnabled);
    }
  }, [user, resetProfile]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  const watchedName = watchProfile('fullName');
  const watchedEmail = watchProfile('email');

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const formData = new FormData();
      formData.append('name', data.fullName);
      formData.append('email', data.email);
      formData.append('mobileNumber', data.mobileNumber);
      formData.append('mfaEnabled', mfaEnabled.toString());

      await updateProfile(formData).unwrap();
      toast.success('Profile information updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile info');
    }
  };

  const onPasswordSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      // Keep existing profile info if needed, but here we only care about password change
      // Usually, the backend handles separate password changes or partial updates
      formData.append('name', watchedName || user?.name || '');
      formData.append('oldPassword', data.currentPassword);
      formData.append('newPassword', data.newPassword);

      await updateProfile(formData).unwrap();
      toast.success('Password updated successfully');
      resetPassword();
    } catch (error) {
      console.error('Failed to update password:', error);
      toast.error('Failed to update password. Please check your current password.');
    }
  };

  const handleGlobalSubmit = () => {
    // This is no longer used, as we have separate buttons
  };

  if (isProfileLoading) {
    return <Box sx={{ p: 4 }}>Loading profile...</Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 80px)' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 1, fontFamily: 'Outfit' }}>
            Profile Settings
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Manage your personal information and security preferences.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Profile Card & Security */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Profile Card */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Box sx={{ position: 'relative', width: 120, height: 120, margin: '0 auto 20px' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    background: 'linear-gradient(135deg, #2463EB 0%, #1E40AF 100%)',
                    fontSize: '40px',
                    fontWeight: 700,
                    boxShadow: '0 10px 15px -3px rgba(36, 99, 235, 0.2)'
                  }}
                >
                  {(isEditing ? watchedName : user?.name)?.charAt(0) || 'U'}
                </Avatar>
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2937', mb: 0.5 }}>
                {isEditing ? watchedName : (user?.name || 'User')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, mb: 3 }}>
                {user?.roles?.[0]?.name?.replace('ROLE_', '').replace('_', ' ') || 'User'}
              </Typography>

              <input
                type="file"
                id="profile-upload"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('File selected:', file.name);
                  }
                }}
              />
              <Button
                variant="outlined"
                fullWidth
                onClick={() => document.getElementById('profile-upload')?.click()}
                sx={{
                  py: 1.25,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: '#E2E8F0',
                  color: '#1F2937',
                  '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }
                }}
              >
                Upload New Photo
              </Button>

              <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

              <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1, backgroundColor: '#F1F5F9', borderRadius: '10px', color: '#64748B' }}>
                    <Mail size={18} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                      {isEditing ? watchedEmail : (user?.email || 'N/A')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Account Security */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1F2937', mb: 3, fontFamily: 'Outfit' }}>
                Account Security
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: mfaEnabled ? '#10B981' : '#94A3B8' }}>
                    <ShieldCheck size={24} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>MFA enabled</Typography>
                </Box>
                <Switch
                  checked={mfaEnabled}
                  onChange={(e) => setMfaEnabled(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#10B981' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10B981' }
                  }}
                />
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* Right Column: Information & Password */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Personal Information */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1F2937', fontFamily: 'Outfit' }}>
                  Personal Information
                </Typography>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="contained"
                    startIcon={<Pencil size={16} />}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 3,
                      backgroundColor: '#111827',
                      '&:hover': { backgroundColor: '#1F2937' }
                    }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    {...registerProfile('fullName')}
                    disabled={!isEditing}
                    errorText={profileErrors.fullName?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: !isEditing ? '#F8FAFC' : '#fff',
                        opacity: !isEditing ? 0.8 : 1
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Input
                    label="Email Address"
                    placeholder="example@mail.com"
                    {...registerProfile('email')}
                    disabled={!isEditing}
                    errorText={profileErrors.email?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: !isEditing ? '#F8FAFC' : '#fff',
                        opacity: !isEditing ? 0.8 : 1
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Input
                    label="Mobile Number"
                    placeholder="+1 234 567 890"
                    {...registerProfile('mobileNumber')}
                    disabled={!isEditing}
                    errorText={profileErrors.mobileNumber?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: !isEditing ? '#F8FAFC' : '#fff',
                        opacity: !isEditing ? 0.8 : 1
                      }
                    }}
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'end', gap: 2 }}>
                  <Button
                    onClick={() => {
                      resetProfile();
                      setIsEditing(false);
                    }}
                    variant="outlined"
                    sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 3 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleProfileSubmit(onProfileSubmit)}
                    variant="contained"
                    sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 3, backgroundColor: '#2563EB' }}
                  >
                    Save Information
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Change Password */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1F2937', mb: 4, fontFamily: 'Outfit' }}>
                Change Password
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Input
                    label="Current Password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="••••••••"
                    fullWidth
                    {...registerPassword('currentPassword')}
                    errorText={passwordErrors.currentPassword?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#fff',
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          size="small"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          sx={{ color: '#94A3B8' }}
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      )
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Input
                    label="New Password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    fullWidth
                    {...registerPassword('newPassword')}
                    errorText={passwordErrors.newPassword?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#fff',
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          size="small"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          sx={{ color: '#94A3B8' }}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      )
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Input
                    label="Confirm New Password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    fullWidth
                    {...registerPassword('confirmNewPassword')}
                    errorText={passwordErrors.confirmNewPassword?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#fff',
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          size="small"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          sx={{ color: '#94A3B8' }}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      )
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'end' }}>
                <Button
                  onClick={handlePasswordSubmit(onPasswordSubmit)}
                  variant="contained"
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 4,
                    py: 1.25,
                    backgroundColor: '#111827',
                    '&:hover': { backgroundColor: '#1F2937' }
                  }}
                >
                  Update Password
                </Button>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
