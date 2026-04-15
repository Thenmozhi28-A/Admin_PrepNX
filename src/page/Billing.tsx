import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Button as MuiButton,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  CreditCard,
  Lock,
  Check,
  X,
  Receipt,
  Zap,
  Globe,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/Button';
import { useGetSubscriptionQuery, useGetPricePlansQuery } from '../store/api/billingApi';
import { useAuth } from '../context/AuthContext';

const Billing: React.FC = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { authStorage } = useAuth();
  const organisationId = authStorage?.data?.organisation?.id || '';

  const {
    data: billingResponse,
    isLoading,
    isError,
    refetch
  } = useGetSubscriptionQuery(organisationId, {
    refetchOnMountOrArgChange: true
  });

  const {
    data: plansResponse,
    isLoading: isPlansLoading
  } = useGetPricePlansQuery(
    { page: 0, size: 20, type: 'BUSINESS' },
    { skip: !showUpgradeModal, refetchOnMountOrArgChange: true }
  );

  const billingData = billingResponse?.data;
  const allPlans = plansResponse?.data || [];

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <LinearProgress sx={{ width: '100%', maxWidth: 400, borderRadius: 4 }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: 2 }}>
        <Typography variant="h6" color="error">Failed to fetch billing data</Typography>
        <Button variant="contained" onClick={() => refetch()} sx={{ backgroundColor: '#111827' }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 80px)' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ color: '#2463EB' }}>
              <CreditCard size={24} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937', fontFamily: 'Outfit' }}>
              Subscription Management
            </Typography>
          </Box>
          <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 600, letterSpacing: '0.1em', ml: { xs: 0, md: 5 }, fontFamily: 'Outfit' }}>
            BILLING, PLANS & USAGE
          </Typography>
        </Box>
      </Box>

      {/* Page Title & Subtitle */}
      <Box sx={{ mb: 4, bgcolor: "white", p: 2, borderRadius: '10px', width: 'fit-content', border: '1px solid #E2E8F0' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.5, fontFamily: 'Outfit' }}>
          Billing & Plans
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '15px', fontFamily: 'Outfit' }}>
          Manage your subscription and payment details.
        </Typography>
      </Box>

      {/* SECTION 1: CURRENT PLAN CARD */}
      <Box
        sx={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid #F3F4F6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          mb: 4,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }
        }}
      >
        {/* Left Side (60%) */}
        <Box sx={{ flex: { md: 6 }, p: { xs: 3, sm: 4 }, borderRight: { md: '1px solid #F3F4F6' } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, letterSpacing: '0.05em' }}>
              CURRENT PLAN
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mt: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#111827', fontFamily: 'Outfit', fontSize: '32px' }}>
                {billingData?.pricePlan.name}
              </Typography>
              <Typography sx={{ color: '#6B7280', fontWeight: 500 }}>
                ₹{billingData?.pricePlan.price} / {billingData?.pricePlan.days} days
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Usage Rows */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>Users</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>{billingData?.usageUsers} / {billingData?.pricePlan.userCount}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((billingData?.usageUsers || 0) / (billingData?.pricePlan.userCount || 1)) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#F3F4F6',
                  '& .MuiLinearProgress-bar': { backgroundColor: '#2463EB' }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>Teams</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#2463EB' }}>
                {billingData?.pricePlan.maxTeams === null ? 'Unlimited' : `${billingData?.usageTeams} / ${billingData?.pricePlan.maxTeams}`}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>Storage</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#6B7280' }}>{billingData?.usageStorageGB}GB / {billingData?.pricePlan.maxStorageGB}GB</Typography>
            </Box>
          </Box>

          {/* Blue Highlight Box */}
          <Box
            sx={{
              backgroundColor: '#F0F7FF',
              borderRadius: '12px',
              p: 3,
              mb: 4,
              border: '1px solid #E0EFFF'
            }}
          >
            <Typography variant="caption" sx={{ color: '#2463EB', fontWeight: 700, letterSpacing: '0.05em', display: 'block', mb: 1 }}>
              TOTAL DUE THIS PERIOD
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 0.5, fontSize: '28px' }}>
              ₹{billingData?.billingAmount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
              {billingData?.usageUsers} users × ₹{billingData?.pricePlan.price} per user · {billingData?.pricePlan.category} plan
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => setShowUpgradeModal(true)}
            sx={{ px: 4, py: 1.5, borderRadius: '10px', fontWeight: 700, backgroundColor: '#2463EB', '&:hover': { backgroundColor: '#1D4ED8' } }}
          >
            Upgrade Plan
          </Button>
        </Box>

        {/* Right Side (40%) */}
        <Box sx={{ flex: { md: 4 }, p: { xs: 3, sm: 4 }, backgroundColor: '#FAFBFC' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Chip
              label={billingData?.pricePlan.active ? "Active" : "Inactive"}
              size="small"
              sx={{
                backgroundColor: billingData?.pricePlan.active ? '#DCFCE7' : '#FEE2E2',
                color: billingData?.pricePlan.active ? '#166534' : '#991B1B',
                fontWeight: 700,
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Payment Method
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
            Manage your billing details.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fff',
              border: '1px solid #F3F4F6',
              borderRadius: '12px',
              p: 2,
              mb: 4
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ color: '#9CA3AF' }}>
                <CreditCard size={20} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                  {billingData?.paymentMethod || 'No payment method'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  {billingData?.paymentStatus || 'No active subscription'}
                </Typography>
              </Box>
            </Box>
            <MuiButton
              variant="text"
              sx={{ textTransform: 'none', fontWeight: 700, color: '#2463EB', minWidth: 'auto', p: 0 }}
            >
              Edit
            </MuiButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{ color: '#9CA3AF', mt: 0.2 }}>
              <Lock size={16} />
            </Box>
            <Typography variant="caption" sx={{ color: '#6B7280', lineHeight: 1.5 }}>
              Your payment information is encrypted and securely processed. We do not store your full card details.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Upgrade Plan Modal */}
      <Dialog
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
            p: 0,
            mx: { xs: 1, sm: 2 },
            maxHeight: { xs: '95vh', sm: 'auto' },
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        {/* Gradient Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2463EB 0%, #7C3AED 100%)',
            p: 3,
            position: 'relative',
            color: '#fff',
            textAlign: 'center'
          }}
        >
          <IconButton
            onClick={() => setShowUpgradeModal(false)}
            sx={{ position: 'absolute', right: 16, top: 16, color: '#fff' }}
          >
            <X size={20} />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Outfit' }}>
            Choose Your Plan
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Outfit' }}>
            Simple, transparent pricing
          </Typography>
        </Box>

        <Box sx={{
          p: { xs: 2, sm: 8 },
          backgroundColor: '#F8FAFC',
          overflowY: 'auto',
          maxHeight: { xs: 'calc(95vh - 160px)', sm: '70vh' }
        }}>


          {/* Plan Cards */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            {isPlansLoading ? (
              <Box sx={{ py: 8, display: 'flex', justifyContent: 'center', width: '100%' }}>
                <LinearProgress sx={{ width: '100%', maxWidth: 400, borderRadius: 4 }} />
              </Box>
            ) : (
              allPlans.map((plan: any) => {
                const isCurrent = plan.name === billingData?.pricePlan.name;
                const priceToShow = plan.price;

                const getIcon = (planType: string, name: string) => {
                  const n = name.toLowerCase();
                  if (planType === 'BASE') return <Zap size={24} />;
                  if (planType === 'MID') return <Rocket size={24} />;
                  if (planType === 'PREMIUM') {
                    if (n.includes('enterprise')) return <ShieldCheck size={24} />;
                    return <Globe size={24} />;
                  }
                  return <Zap size={24} />;
                };

                const processedFeatures = plan.features.flatMap((f: string) => f.split(',').map((s: string) => s.trim()));

                return (
                  <Box
                    key={plan.id}
                    sx={{
                      flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 23%' },
                      maxWidth: { md: '24%' },
                      backgroundColor: '#fff',
                      borderRadius: '16px',
                      border: isCurrent ? '2px solid #2463EB' : '1px solid #E5E7EB',
                      p: 3,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
                    }}
                  >
                    {isCurrent && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: '#2463EB',
                          color: '#fff',
                          px: 2,
                          py: 0.5,
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          zIndex: 1
                        }}
                      >
                        Current Plan
                      </Box>
                    )}

                    <Box sx={{ color: isCurrent ? '#2463EB' : '#6B7280', mb: 2 }}>
                      {getIcon(plan.planType, plan.name)}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Outfit' }}>{plan.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827' }}>₹{priceToShow}</Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>/month</Typography>
                    </Box>
                    <Chip
                      label={plan.planType}
                      size="small"
                      sx={{
                        width: 'fit-content',
                        height: '22px',
                        fontSize: '10px',
                        fontWeight: 700,
                        mb: 2,
                        backgroundColor: '#F3F4F6',
                        color: '#374151',
                        textTransform: 'capitalize'
                      }}
                    />
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ flexGrow: 1, mb: 3 }}>
                      {processedFeatures.map((feature: string, idx: number) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-start' }}>
                          <Box sx={{ color: '#10B981', mt: 0.3 }}>
                            <Check size={14} />
                          </Box>
                          <Typography variant="caption" sx={{ color: '#4B5563', lineHeight: 1.4, fontWeight: 500 }}>
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <MuiButton
                      variant={isCurrent ? "outlined" : "contained"}
                      disabled={isCurrent}
                      fullWidth
                      sx={{
                        textTransform: 'none',
                        fontWeight: 800,
                        borderRadius: '10px',
                        py: 1,
                        backgroundColor: isCurrent ? 'transparent' : '#111827',
                        color: isCurrent ? '#9CA3AF' : '#fff',
                        borderColor: isCurrent ? '#E5E7EB' : 'transparent',
                        '&:hover': { backgroundColor: isCurrent ? 'transparent' : '#1F2937' }
                      }}
                    >
                      {isCurrent ? 'Current Plan' : 'Switch Plan'}
                    </MuiButton>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Dialog>

      {/* SECTION 3: BILLING HISTORY */}
      <Box sx={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F3F4F6', p: { xs: 3, sm: 4 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontFamily: 'Outfit' }}>
            Billing History
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '14px', fontFamily: 'Outfit' }}>
            View past invoices and payments.
          </Typography>
        </Box>

        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <TableContainer sx={{ border: '1px solid #F3F4F6', borderRadius: '12px', overflow: 'hidden', minWidth: '600px' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
                <TableRow>
                  {['DATE', 'AMOUNT', 'STATUS', 'INVOICE'].map((head) => (
                    <TableCell key={head} sx={{ py: 2, fontSize: '11px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em' }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Empty state implementation as requested */}
                <TableRow>
                  <TableCell colSpan={4} sx={{ py: 10, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 2, backgroundColor: '#F9FAFB', borderRadius: '50%', color: '#9CA3AF' }}>
                        <Receipt size={32} strokeWidth={1.5} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                        No billing history available
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default Billing;
