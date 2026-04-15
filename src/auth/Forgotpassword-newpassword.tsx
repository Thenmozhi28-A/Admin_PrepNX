import { useState } from 'react';
import { Box, Typography, InputAdornment, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ForgotRightSideUI } from '../components/ui/ForgotRightSideUI';
import { newPasswordSchema } from '../Yup/Schema';
import type { NewPasswordValues } from '../types/Types';

import { motion } from 'framer-motion';

export default function ForgotPasswordNewPassword() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<NewPasswordValues>({
    resolver: yupResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = (_data: NewPasswordValues) => {
    setIsLoading(true);
    console.log('Resetting password...');
    setTimeout(() => {
      setIsLoading(false);
      navigate('/forgot-password/success');
    }, 2000);
  };

  return (
    <Box sx={{ display: 'flex', height: { xs: 'auto', md: '100vh' }, backgroundColor: '#fff', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', flex: 1, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left Side - Form Section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            flex: { xs: '1 1 100%', md: '1 1 50%' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 4, md: 12 },
            py: 12
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 480 }}>
            {/* Logo */}
            <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '8px', background: 'linear-gradient(135deg, #2463EB 0%, #1E40AF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#fff', fontSize: '1.25rem', fontWeight: 600 }}>P</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.875rem' }}>
                <Box component="span" sx={{ background: 'linear-gradient(90deg, #2463EB 0%, #1E40AF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Prep</Box>
                <Box component="span" sx={{ color: '#1F2937' }}>NX</Box>
              </Typography>
            </Box>

            <Box sx={{ mb: 8 }}>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 600, color: '#1F2937', mb: 1.5, lineHeight: 1.2 }}>
                Create New Password
              </Typography>
              <Typography sx={{ color: '#6B7280', fontSize: '1.125rem' }}>
                Your new password must be different from previously used passwords.
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)} >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  {...register('password')}
                  errorText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#9CA3AF' }}>
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  errorText={errors.confirmPassword?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: '#9CA3AF' }}>
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          </Box>
        </Box>

        {/* Right Side - Info Panel */}
        <Box
          sx={{
            flex: '1 1 50%',
            display: { xs: 'none', md: 'block' }
          }}
        >
          <ForgotRightSideUI />
        </Box>
      </Box>
    </Box>
  );
}
