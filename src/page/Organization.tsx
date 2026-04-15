import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Avatar } from '@mui/material';
import { Building2, Edit3, Image as ImageIcon, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Label } from '../components/Label';
import type { OrganizationValues } from '../types/Types';
import { organizationSchema } from '../Yup/Schema';
import { useGetOrganizationQuery, useUpdateOrganizationMutation } from '../store/api/organizationApi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Organization: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [updateOrganization, { isLoading: isUpdating }] = useUpdateOrganizationMutation();

  const { authStorage } = useAuth();
  const organisationId = authStorage?.data?.organisation?.id || '';

  // Use dynamic ID from login session
  const { data: orgResponse, error, isLoading, refetch } = useGetOrganizationQuery(organisationId, {
    refetchOnMountOrArgChange: true,
  });

  const orgData = orgResponse?.data;

  console.log('Organization Component Rendered');
  console.log('Org Response:', orgResponse);
  console.log('Org Error:', error);
  console.log('Org Loading:', isLoading);

  useEffect(() => {
    console.log('Organization Component Mounted');
  }, []);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<OrganizationValues>({
    resolver: yupResolver(organizationSchema),
    defaultValues: {
      orgName: '',
      email: '',
    }
  });

  // Sync form values with API data
  useEffect(() => {
    if (orgData) {
      setValue('orgName', orgData.name || '');
      setValue('email', orgData.email || '');
      setLogoPreview(orgData.logoUrl || null);
    }
  }, [orgData, setValue]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  // const onSave = async (data: OrganizationValues) => {
  //   try {
  //     await updateOrganization({
  //       id: organisationId,
  //       organization: {
  //         name: data.orgName,
  //         email: data.email,
  //         logoUrl: logoPreview // Include logo if it has changed
  //       }
  //     }).unwrap();
  //     setIsEditing(false);
  //     toast.success('Organization profile updated successfully');
  //   } catch (error) {
  //     console.error('Failed to update organization:', error);
  //     toast.error('Failed to update organization profile');
  //   }
  // };

  // const onSave = async (data: OrganizationValues) => {
  //   try {
  //     await updateOrganization({
  //       id: organisationId,
  //       organization: {
  //         name: data.orgName,
  //         email: data.email,
  //         logoUrl: logoPreview,
  //       }
  //     }).unwrap();

  //     setIsEditing(false); // cache is already patched by onQueryStarted before this runs
  //     toast.success('Organization profile updated successfully');
  //   } catch (error) {
  //     console.error('Failed to update organization:', error);
  //     toast.error('Failed to update organization profile');
  //   }
  // };

  // const onSave = async (data: OrganizationValues) => {
  //   try {
  //     const payload: any = {
  //       name: data.orgName,
  //       email: data.email,
  //     };

  //     // S3 URL-ஆ இருந்தா logoUrl அனுப்பவே வேண்டாம்
  //     // base64 (data:image/...) மட்டும் அனுப்பு
  //     if (logoPreview && logoPreview.startsWith('data:')) {
  //       payload.logoUrl = logoPreview;
  //     }

  //     await updateOrganization({
  //       id: organisationId,
  //       organization: payload,
  //     }).unwrap();

  //     setIsEditing(false);
  //     toast.success('Organization profile updated successfully');
  //   } catch (error) {
  //     console.error('Failed to update organization:', error);
  //     toast.error('Failed to update organization profile');
  //   }
  // };

  const onSave = async (data: OrganizationValues) => {
    try {
      const formData = new FormData();
      formData.append('name', data.orgName);
      formData.append('email', data.email);

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      console.log('Sending FormData...');
      for (const pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      await updateOrganization({
        id: organisationId,
        organization: formData,
      }).unwrap();

      refetch();
      setIsEditing(false);
      setLogoFile(null);
      toast.success('Organization profile updated successfully');
    } catch (error) {
      console.error('Failed to update:', error);
      toast.error('Failed to update organization profile');
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return <Box sx={{ p: 4 }}>Loading...</Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: 'calc(100vh - 80px)' }}>
      {/* Hidden File Input */}
      <Box
        component="input"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        sx={{ display: 'none' }}
        aria-label="Organization Logo Upload"
      />

      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ color: '#2463EB' }}>
              <Building2 size={24} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937' }}>
              Organization Profile
            </Typography>
          </Box>
          <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 600, letterSpacing: '0.1em', ml: { xs: 0, md: 5 } }}>
            WORKSPACE SETTINGS
          </Typography>
        </Box>
        {!isEditing && (
          <Button
            variant="outlined"
            onClick={handleEdit}
            startIcon={<Edit3 size={18} />}
            sx={{ px: 3, borderColor: '#E5E7EB', color: '#374151', '&:hover': { borderColor: '#2463EB', color: '#2463EB' } }}
          >
            Edit
          </Button>
        )}
      </Box>

      {/* Main Content Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid #F3F4F6',
          p: { xs: 3, sm: 5 },
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
        component="form"
        onSubmit={handleSubmit(onSave)}
      >
        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* Left Section: Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Input
                label="Organization Name"
                {...register('orgName')}
                disabled={!isEditing}
                placeholder="Enter organization name"
                errorText={errors.orgName?.message}
              />

              <Input
                label="Business Email"
                {...register('email')}
                disabled={!isEditing}
                placeholder="admin@example.com"
                errorText={errors.email?.message}
                sx={{
                  '& .MuiFormHelperText-root': {
                    color: errors.email ? '#d32f2f' : '#6B7280',
                    fontSize: '0.75rem',
                    ml: 0,
                    mt: 1,
                  }
                }}
              />
            </Box>
          </Grid>

          {/* Right Section: Logo */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Label>Organization Logo</Label>
              <Box
                sx={{
                  mt: 1,
                  border: '1px dashed #E5E7EB',
                  borderRadius: '16px',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F9FAFB',
                  flexGrow: 1,
                  minHeight: '200px',
                  position: 'relative',
                  transition: 'all 0.2s',
                  borderColor: isEditing ? '#2463EB' : '#E5E7EB',
                  // '&:hover': {
                  //   borderColor: isEditing ? '#2463EB' : '#E5E7EB',
                  //   backgroundColor: isEditing ? 'rgba(36, 99, 235, 0.02)' : '#F9FAFB',
                  // }
                }}
              >
                <Avatar
                  src={logoPreview || undefined}
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '12px',
                    backgroundColor: '#fff',
                    border: '1px solid #F3F4F6',
                    mb: 2,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {!logoPreview && <ImageIcon size={40} color="#9CA3AF" />}
                </Avatar>

                <Button
                  variant="outlined"
                  size="small"
                  disabled={!isEditing}
                  onClick={handleLogoClick}
                  sx={{
                    borderColor: '#E5E7EB',
                    color: '#374151',
                    fontSize: '13px',
                    py: 1,
                    textTransform: 'none',
                    '&:hover': { borderColor: '#2463EB', color: '#2463EB' }
                  }}
                >
                  <Camera size={16} style={{ marginRight: '8px' }} />
                  Change Logo
                </Button>

                <Typography sx={{ mt: 2, fontSize: '12px', color: '#9CA3AF' }}>
                  JPG, PNG or SVG. Max 2MB.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Footer Actions */}
        {isEditing && (
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setIsEditing(false)}
              sx={{ px: 4, borderColor: '#E5E7EB', color: '#374151', fontSize: { xs: '12px', md: '16px' } }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{ px: 4, fontSize: { xs: '12px', md: '16px' } }}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Organization;
