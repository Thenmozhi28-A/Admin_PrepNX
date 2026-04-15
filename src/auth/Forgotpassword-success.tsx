import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { ForgotRightSideUI } from '../components/ui/ForgotRightSideUI';

export default function ForgotPasswordSuccess() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', height: { xs: 'auto', md: '100vh' }, backgroundColor: '#fff', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', flex: 1, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left Side - Success Content */}
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
              <Box sx={{ width: 96, height: 96, borderRadius: '50%', backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={56} color="#fff" />
              </Box>
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 600, color: '#1F2937', mb: 2, fontSize: { xs: '1.5rem', md: '2rem' } }}>
              Password Reset Successful
            </Typography>
            <Typography sx={{ color: '#6B7280', mb: 6, fontSize: { xs: '0.9rem', md: '1.125rem' } }}>
              Your password has been successfully reset.<br />
              You can now log in with your new password.
            </Typography>

            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </Box>
        </Box>

        {/* Right Side - Info Panel (Hidden on mobile) */}
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
