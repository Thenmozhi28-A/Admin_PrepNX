import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ForgotRightSideUI } from '../components/ui/ForgotRightSideUI';
import { forgotEmailSchema } from '../Yup/Schema';
import type { ForgotEmailValues } from '../types/Types';

import { motion } from 'framer-motion';

export default function ForgotPasswordEmail() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotEmailValues>({
    resolver: yupResolver(forgotEmailSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = (data: ForgotEmailValues) => {
    setIsLoading(true);
    console.log('Sending reset code to:', data.email);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/forgot-password/otp', { state: { email: data.email } });
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
                Reset Your Password
              </Typography>
              <Typography sx={{ color: '#6B7280', fontSize: '1.125rem' }}>
                Enter your email address and we'll send you a code to reset your password.
              </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
               <Input
                 label="Email Address"
                 placeholder="Enter your email"
                 autoComplete="off"
                 {...register('email')}
                 errorText={errors.email?.message}
               />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                {isLoading ? 'Sending Code...' : 'Send Reset Code'}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<ArrowLeft size={18} />}
                onClick={() => navigate('/login')}
                sx={{ mt: 3 }}
              >
                Back to Login
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
