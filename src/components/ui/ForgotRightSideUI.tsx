
import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const steps = [
  {
    step: '1',
    title: 'Enter Your Email',
    desc: 'Provide the email address associated with your account.',
  },
  {
    step: '2',
    title: 'Verify OTP Code',
    desc: 'Enter the 6-digit code sent to your email.',
  },
  {
    step: '3',
    title: 'Create New Password',
    desc: 'Set a strong password and regain access to your account.',
  },
];

export const ForgotRightSideUI: React.FC = () => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      sx={{
        width: '100%',
        background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #DBEAFE 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 4, md: 10 },
        py: 10,
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: '100vh', md: 'auto' },
        height: { xs: 'auto', md: '100vh' },
      }}
    >

      {/* Floating Symbols */}
      <Box sx={{ position: 'absolute', top: '10%', left: '8%', color: '#2463EB', opacity: 0.08, fontSize: '3rem', fontWeight: 700, userSelect: 'none' }}>?</Box>
      <Box sx={{ position: 'absolute', top: '15%', right: '10%', color: '#2463EB', opacity: 0.06, fontSize: '2rem', fontWeight: 700, userSelect: 'none' }}>🛡️</Box>
      <Box sx={{ position: 'absolute', top: '40%', right: '5%', color: '#2463EB', opacity: 0.08, fontSize: '2rem', fontWeight: 700, userSelect: 'none' }}>?</Box>
      <Box sx={{ position: 'absolute', bottom: '15%', left: '12%', color: '#2463EB', opacity: 0.08, fontSize: '3rem', fontWeight: 700, userSelect: 'none' }}>?</Box>
      <Box sx={{ position: 'absolute', bottom: '20%', right: '10%', color: '#2463EB', opacity: 0.07, fontSize: '1.5rem', fontWeight: 700, userSelect: 'none' }}>🔒</Box>

      <Box sx={{ width: '100%', maxWidth: 650, position: 'relative', zIndex: 10, textAlign: 'center' }}>

        {/* Heading Section */}
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#1F2937', mb: 2, fontSize: '38px', lineHeight: 1.2 }}>
          Secure Password Reset
        </Typography>
        <Typography sx={{ color: '#6B7280', fontWeight: 400, fontSize: '18px', mb: 6, lineHeight: 1.6, maxWidth: '580px', mx: 'auto' }}>
          We take your account security seriously. Follow the simple steps to reset your password securely.
        </Typography>

        {/* Steps Cards */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {steps.map(({ step, title, desc }, idx) => (
            <Box
              key={idx}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                backgroundColor: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.8)',
                p: { xs: 3 },
                textAlign: 'left',
                boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  backgroundColor: '#fff',
                  boxShadow: '0 20px 50px rgba(36,99,235,0.08)',
                  borderColor: 'rgba(36,99,235,0.15)',
                },
              }}
            >
              {/* Large Step Number */}
              <Box sx={{
                width: 64, height: 64,
                borderRadius: '50%',
                background: '#EEF2FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Typography sx={{ color: '#2463EB', fontWeight: 700, fontSize: '24px' }}>
                  {step}
                </Typography>
              </Box>

              {/* Text Content */}
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#1F2937', fontSize: '20px', mb: 0.5 }}>
                  {title}
                </Typography>
                <Typography sx={{ color: '#6B7280', fontSize: '15px', lineHeight: 1.5 }}>
                  {desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

      </Box>
    </Box>
  );
};

export default ForgotRightSideUI;