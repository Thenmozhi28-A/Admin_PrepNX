import { useState } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';
import { Box, Typography, Link as MuiLink } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from '../components/Button';
import { ForgotRightSideUI } from '../components/ui/ForgotRightSideUI';
import { motion } from 'framer-motion';

export default function ForgotPasswordOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = () => {
    if (otp.join('').length === 6) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigate('/forgot-password/new-password');
      }, 2000);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: { xs: 'auto', md: '100vh' }, backgroundColor: '#fff', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', flex: 1, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left Side - OTP Section */}
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
          <Box sx={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Box sx={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={40} color="#2463EB" />
              </Box>
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 600, color: '#1F2937', mb: 1.5, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
              Verify Your Email
            </Typography>
            <Typography sx={{ color: '#6B7280', mb: 6, fontSize: '1.125rem' }}>
              We've sent a 6-digit reset code to<br />
              <Box component="span" sx={{ color: '#2463EB', fontWeight: 500 }}>{email}</Box>
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 0.75, sm: 1.5 }, mb: 6 }}>
              {otp.map((digit, index) => (
                <Box
                  key={index}
                  component="input"
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                  sx={{
                    width: { xs: 40, sm: 64 },
                    height: { xs: 40, sm: 64 },
                    textAlign: 'center',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    fontWeight: 600,
                    borderRadius: '12px',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #cfcfcfff',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    '&:focus': {
                      backgroundColor: '#fff',
                      borderColor: '#2463EB',
                      boxShadow: '0 0 0 4px rgba(36, 99, 235, 0.1)',
                    }
                  }}
                />
              ))}
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleVerify}
              disabled={otp.join('').length !== 6 || isLoading}
              sx={{ mb: 4 }}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Didn't receive the code?{' '}
              <MuiLink
                component="button"
                variant="body2"
                onClick={() => console.log('Resend OTP')}
                sx={{ color: '#2463EB', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#1E40AF' } }}
              >
                Resend Code
              </MuiLink>
            </Typography>
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
