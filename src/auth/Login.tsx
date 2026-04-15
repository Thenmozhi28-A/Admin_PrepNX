import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, InputAdornment, Link } from '@mui/material';
import { Eye, EyeOff, GraduationCap, BookOpenCheck, BarChart3, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { loginSchema } from '../Yup/Schema';
import type { LoginValues } from '../types/Types';
import { useLoginMutation } from '../store/api/authApi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const features = [
  { icon: GraduationCap, title: 'Student Management', desc: 'Enroll, track & manage' },
  { icon: BookOpenCheck, title: 'Content Control', desc: 'Upload & organize material' },
  { icon: BarChart3, title: 'Performance Analytics', desc: 'Deep insights & reports' },
  { icon: ClipboardList, title: 'Mock Test Builder', desc: 'Create & schedule tests' },
];

const stats = [
  { value: '15K+', label: 'Students' },
  { value: '500+', label: 'Qualified' },
  { value: '200+', label: 'Mock Tests' },
];

// Floating decorative symbols — ? * · ◈ scattered positions
const floatingSymbols = [
  { symbol: '?', top: '8%', left: '6%', size: '2.25rem', opacity: 0.07, color: '#2463EB' },
  { symbol: '*', top: '14%', right: '8%', size: '2.5rem', opacity: 0.06, color: '#1E40AF' },
  { symbol: '?', top: '38%', right: '5%', size: '1.75rem', opacity: 0.06, color: '#2463EB' },
  { symbol: '·', top: '55%', left: '4%', size: '3rem', opacity: 0.10, color: '#1E40AF' },
  { symbol: '*', bottom: '18%', left: '10%', size: '1.5rem', opacity: 0.05, color: '#2463EB' },
  { symbol: '?', bottom: '10%', right: '7%', size: '2rem', opacity: 0.06, color: '#1E40AF' },
  { symbol: '◈', top: '72%', right: '12%', size: '1.25rem', opacity: 0.05, color: '#2463EB' },
  { symbol: '·', top: '25%', left: '3%', size: '2.5rem', opacity: 0.08, color: '#1E40AF' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuthData } = useAuth();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: ''
    }
  });

  // Debug errors if any
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Validation Errors:', errors);
    }
  }, [errors]);

  const onSubmit = async (data: LoginValues) => {
    try {
      const response = await login(data).unwrap();
      console.log('Login success:', response);

      // Assuming the API returns the token in a field called 'token' or 'accessToken'
      // Based on common patterns. Adjust if the API structure is different.
      // const token = response.token || response.accessToken || response.jwt || response.access_token || response.data?.token || response.data?.jwt;

      const token = response.token || response.data?.token;
      // const token = response?.data?.token;

      if (token) {
        setAuthData(token, response); // Save token and full response as authStorage
        toast.success('Login successful!');
        navigate('/admin/organization');
      } else {
        toast.error('Token not found in response');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      toast.error(err.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: { xs: 'auto', md: '100vh' }, backgroundColor: '#fff', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', flex: 1, flexDirection: { xs: 'column', md: 'row' } }}>

        {/* ── Left Side – Form ── */}
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
            py: 12,
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 480 }}>

            {/* Logo */}
            <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: '8px',
                background: 'linear-gradient(135deg, #2463EB 0%, #1E40AF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ color: '#fff', fontSize: '1.25rem', fontWeight: 600 }}>P</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.875rem' }}>
                <Box component="span" sx={{ background: 'linear-gradient(90deg, #2463EB 0%, #1E40AF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Prep
                </Box>
                <Box component="span" sx={{ color: '#1F2937' }}>NX</Box>
              </Typography>
            </Box>

            {/* Heading */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' }, fontWeight: 600, color: '#1F2937', mb: 1.5, lineHeight: 1.2 }}>
                Welcome Back
              </Typography>
              <Typography sx={{ color: '#6B7280', fontSize: '1rem' }}>
                Sign in to your PrepNX admin account
              </Typography>
            </Box>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Email Address"
                placeholder="Enter your email"
                size="medium"
                autoComplete="off"
                {...register('identifier')}
                errorText={errors.identifier?.message}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                size="medium"
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

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/forgot-password')}
                  sx={{ color: '#2463EB', fontWeight: 500, textDecoration: 'none', '&:hover': { color: '#1E40AF', textDecoration: 'underline' } }}
                >
                  Forgot Password?
                </Link>
              </Box>

              <Button type="submit" variant="contained" fullWidth disabled={isLoginLoading}>
                {isLoginLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

          </Box>
        </Box>

        {/* ── Right Side – Admin Info Panel ── */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{
            flex: '1 1 58%',
            background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #DBEAFE 100%)',
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: 8,
            py: 8,
            position: 'relative',
            overflow: 'hidden',

          }}
        >

          {/* Floating symbols — ? * · ◈ */}
          {floatingSymbols.map((s, i) => (
            <Box
              key={i}
              component={motion.div}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
              sx={{
                position: 'absolute',
                top: s.top ?? 'auto',
                bottom: s.bottom ?? 'auto',
                left: s.left ?? 'auto',
                right: s.right ?? 'auto',
                fontSize: s.size,
                fontWeight: 700,
                color: s.color,
                opacity: s.opacity,
                userSelect: 'none',
                pointerEvents: 'none',
                lineHeight: 1,
              }}
            >
              {s.symbol}
            </Box>
          ))}

          <Box sx={{ width: '100%', maxWidth: 650, zIndex: 2 }}>

            {/* Badge */}
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 2,
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(36,99,235,0.2)',
              borderRadius: '20px', px: 2, py: 1, mb: 4,
            }}>
              <Box sx={{ width: 7, height: 7, background: '#2463EB', borderRadius: '50%' }} />
              <Typography sx={{ fontSize: '0.75rem', color: '#2463EB', fontWeight: 500 }}>
                PrepNX Admin Console
              </Typography>
            </Box>
            {/* Title */}
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#1F2937', mb: 2, fontSize: '42px', lineHeight: 1.2 }}>
              Manage PrepNX from one place
            </Typography>
            <Typography sx={{ color: '#4B5563', mb: 5, fontSize: '18px', maxWidth: '100%', mx: 'auto', lineHeight: 1.6 }}>
              Full control over students, content, and tests. Track performance and manage everything from one powerful admin panel.
            </Typography>

            {/* Features Grid Layout - 3 in first row, 1 full width in second row */}
            {(() => {
              const FourthIcon = features[3].icon;
              return (
                <>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 3 }}>
                    {features.slice(0, 3).map(({ icon: Icon, title, desc }, i) => (
                      <Box
                        key={i}
                        component={motion.div}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                        sx={{
                          background: 'rgba(255,255,255,0.75)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.6)',
                          borderRadius: '16px',
                          p: 2.5,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            width: 44, height: 44,
                            background: '#EEF2FF',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            transition: 'transform 0.4s ease',
                            '&:hover': {
                              transform: 'rotate(360deg)',
                            },
                          }}
                        >
                          <Icon size={24} color="#2463EB" />
                        </Box>
                        <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1F2937', mb: 0.5 }}>
                          {title}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                          {desc}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Fourth Feature Card - Full Width (Testimonial style) */}
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.65 }}
                    sx={{
                      background: 'rgba(255,255,255,0.75)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.6)',
                      borderRadius: '16px',
                      p: 3,
                      mb: 4,
                      mt: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      textAlign: 'left',

                    }}
                  >
                    <Box
                      sx={{
                        width: 50, height: 50,
                        background: '#EEF2FF',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'transform 0.4s ease',
                        '&:hover': {
                          transform: 'rotate(360deg)',
                        },
                      }}
                    >
                      <FourthIcon size={28} color="#2463EB" />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#1F2937' }}>
                        {features[3].title}
                      </Typography>
                      <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                        "{features[3].desc}. The mock tests are incredibly realistic and help identify weak areas quickly."
                      </Typography>
                    </Box>
                  </Box>
                </>
              );
            })()}

            {/* Modern Pill Statistics Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.5, mt: 6 }}>
              {stats.map(({ value, label }, i) => (
                <Box
                  key={i}
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                  sx={{
                    borderRadius: '50px',
                    px: 3.5,
                    py: 1.5,
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 25px rgba(36,99,235,0.12)',
                      borderColor: 'rgba(36,99,235,0.2)',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: '#2463EB',
                      fontSize: '1.25rem',
                      lineHeight: 1,
                      mb: 0.25,
                    }}
                  >
                    {value}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      color: '#6B7280',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>

          </Box>
        </Box>

      </Box>
    </Box>
  );
}