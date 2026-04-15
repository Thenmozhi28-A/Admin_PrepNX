import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Shield,
  AlertTriangle,
  X,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Search,
  Copy,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { blockIpSchema } from '../Yup/Schema';
import { useGetAuditLogsQuery, useBlockIpMutation } from '../store/api/auditApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface BlockIpForm {
  ip: string;
  reason: string;
}

// Mock data removed in favor of live API

const AuditLog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBlockModal, setShowBlockModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(0); // API uses 0-based indexing
  const pageSize = 10;

  const { logout, authStorage } = useAuth();
  const navigate = useNavigate();
  const [blockIp, { isLoading: isBlocking }] = useBlockIpMutation();
  const organisationId = authStorage?.data?.organisation?.id || '';

  const { data: auditResponse, isLoading } = useGetAuditLogsQuery({
    organisationId,
    page: currentPage,
    size: pageSize

  }, {
    refetchOnMountOrArgChange: true
  });

  const logs = auditResponse?.data?.content || [];
  const totalPages = auditResponse?.data?.page?.totalPages || 0;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<BlockIpForm>({
    resolver: yupResolver(blockIpSchema),
    defaultValues: {
      ip: '',
      reason: ''
    }
  });

  const handleOpenBlockModal = (ip: string) => {
    setValue('ip', ip);
    setShowBlockModal(true);
  };

  const onBlockSubmit = async (data: BlockIpForm) => {
    try {
      await blockIp(data).unwrap();
      setShowBlockModal(false);
      reset();

      // Show red error toast as requested
      toast.error('IP Blocked', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { backgroundColor: '#E11D48', color: '#fff' }
      });

      // Auto logout and redirect
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to block IP:', error);
      toast.error('Failed to block IP');
    }
  };

  // Helper to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper to format actions and status
  const getLogInfo = (action: string) => {
    const isSuccess = action.includes('SUCCESS');
    return {
      status: isSuccess ? 'Success' : 'Failed',
      message: action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    };
  };

  // Helper to format time
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = Math.max(0, now - timestamp);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  };

  // Filtering Logic (Client-side for now as API doesn't seem to support filters in provided URL)
  const filteredLogs = logs.filter(log => {
    const info = getLogInfo(log.action);
    const matchesSearch =
      log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || info.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Pagination Logic: Calculate visible page range
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

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 80px)' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ color: '#2463EB' }}>
              <Shield size={24} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937', fontFamily: 'Outfit' }}>
              Security & Audit
            </Typography>
          </Box>
          <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 600, letterSpacing: '0.1em', ml: { xs: 0, md: 5 }, fontFamily: 'Outfit' }}>
            ACCESS LOGS, SECURITY POLICIES & MONITORING
          </Typography>
        </Box>
      </Box>

      {/* Suspicious Activity Alert Banner */}
      <Box
        sx={{
          mb: 4,
          p: 2,
          backgroundColor: '#FFF1F2',
          border: '1px solid #FFE4E6',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1, backgroundColor: '#FFE4E6', borderRadius: '8px', color: '#E11D48' }}>
            <ShieldAlert size={20} />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#9F1239', fontFamily: 'Outfit' }}>
              Suspicious activity detected from IP:
              <Box component="span" sx={{ mx: 1, p: '2px 8px', backgroundColor: '#FB7185', color: '#fff', borderRadius: '4px', fontWeight: 800 }}>
                185.12.45.67
              </Box>
            </Typography>
            <Typography variant="caption" sx={{ color: '#BE123C', fontFamily: 'Outfit' }}>
              Multiple failed login attempts detected in the last 5 minutes.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={() => handleOpenBlockModal('185.12.45.67')}
          sx={{
            backgroundColor: '#E11D48',
            '&:hover': { backgroundColor: '#BE123C' },
            fontWeight: 700,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '13px'
          }}
        >
          Block IP Address
        </Button>
      </Box>

      {/* Filters & Search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1, minWidth: '300px' }}>
          <Input
            placeholder="Search activity, users or IP..."
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 0 }}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 140, }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            sx={{ borderRadius: '10px', height: '42px', backgroundColor: '#fff', fontSize: '14px', fontWeight: 600, fontFamily: 'Outfit' }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>

        {/* <Button
          variant="outlined"
          sx={{
            height: '42px',
            borderColor: '#E2E8F0',
            color: '#64748B',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            px: 2,
            gap: 1,

          }}
        >
          <Calendar size={18} />
          <span>Last 7 Days</span>
        </Button> */}
      </Box>

      {/* Audit Log Table */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            minWidth: '800px', // Ensure table has enough width to trigger scroll
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                {['USER', 'STATUS', 'IP ADDRESS', 'TIME', 'ACTIONS'].map((head) => (
                  <TableCell
                    key={head}
                    sx={{ py: 2, fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', backgroundColor: '#F0F7FF', }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 10, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: '#64748B', fontFamily: 'Outfit' }}>
                      Loading audit logs...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const { status, message } = getLogInfo(log.action);
                  return (
                    <TableRow key={log.id} sx={{ '&:hover': { backgroundColor: '#F9FAFB', '&:hover': { backgroundColor: '#f8f1f9ff' } } }}>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={log.user.profilePicture || undefined}
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: '12px',
                              fontWeight: 700,
                              backgroundColor: status === 'Success' ? '#EFF6FF' : '#FFF1F2',
                              color: status === 'Success' ? '#2463EB' : '#E11D48',
                              border: `1px solid ${status === 'Success' ? '#DBEAFE' : '#FFE4E6'}`
                            }}
                          >
                            {getInitials(log.user.name)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937', fontFamily: 'Outfit' }}>
                              {log.user.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                              {message}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={status}
                          size="small"
                          sx={{
                            height: '24px',
                            fontSize: '11px',
                            fontWeight: 800,
                            borderRadius: '6px',
                            backgroundColor: status === 'Success' ? '#DCFCE7' : '#FEE2E2',
                            color: status === 'Success' ? '#166534' : '#991B1B'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: '#4B5563', fontFamily: 'monospace', fontWeight: 500 }}>
                            {log.ipAddress}
                          </Typography>
                          <IconButton size="small" onClick={() => copyToClipboard(log.ipAddress)} sx={{ p: 0.5, color: '#94A3B8' }}>
                            <Copy size={14} />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
                          {formatTime(log.timestamp)} ago
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          variant="caption"
                          onClick={() => handleOpenBlockModal(log.ipAddress)}
                          sx={{
                            color: '#E11D48',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '11px',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          Block
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 10, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#94A3B8' }}>
                      <Search size={48} strokeWidth={1.5} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569', mb: 0.5 }}>No logs found</Typography>
                        <Typography variant="body2">We couldn't find any logs matching "{searchQuery}"</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Pagination */}
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


      {/* BLOCK IP MODAL */}
      <Dialog
        open={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            width: '400px',
            p: 0,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Outfit', fontSize: '18px' }}>
            Block IP Address
          </Typography>
          <IconButton onClick={() => setShowBlockModal(false)} size="small">
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#1F2937' }}>Target IP Address</Typography>
            <Input
              fullWidth
              autoFocus
              placeholder="Enter IP address"
              {...register('ip')}
              errorText={errors.ip?.message}
              sx={{
                mb: 0,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fff', // Changed from #F8FAFC to #fff to look more editable
                  cursor: 'text'
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#1F2937' }}>Reason for restriction</Typography>
            <Input
              fullWidth
              placeholder="e.g., Excessive login failures"
              multiline
              rows={2}
              {...register('reason')}
              errorText={errors.reason?.message}
              sx={{ mb: 0 }}
            />
          </Box>

          <Box
            sx={{
              p: 2,
              backgroundColor: '#FFFBEB',
              border: '1px solid #FEF3C7',
              borderRadius: '8px',
              display: 'flex',
              gap: 1.5,
              mb: 1
            }}
          >
            <AlertTriangle size={18} color="#D97706" style={{ minWidth: 18, marginTop: 2 }} />
            <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 500, lineHeight: 1.5 }}>
              This action will immediately revoke all active sessions for this IP and prevent future access.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3, pt: 0, display: 'flex', gap: 1.5 }}>
          <Button
            onClick={() => {
              setShowBlockModal(false);
              reset();
            }}
            fullWidth
            sx={{
              backgroundColor: 'transparent',
              textTransform: 'none',
              fontWeight: 700,
              color: '#64748B',
              borderRadius: '10px',
              py: 1,
              '&:hover': { backgroundColor: '#F1F5F9' }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            disabled={isBlocking}
            onClick={handleSubmit(onBlockSubmit)}
            sx={{
              backgroundColor: '#111827',
              '&:hover': { backgroundColor: '#1F2937' },
              fontWeight: 700,
              borderRadius: '10px',
              py: 1
            }}
          >
            {isBlocking ? 'Blocking...' : 'Block IP'}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AuditLog;
