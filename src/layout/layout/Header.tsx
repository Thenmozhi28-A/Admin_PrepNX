import { useState, useEffect } from 'react';
import type { FC, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  styled,
  Button as MuiButton,
  Badge,
} from '@mui/material';
import {
  Headphones,
  Video,
  Bell,
  ChevronDown,
  User,
  Menu as MenuIcon,
  LogOut,
  Search,
  AlertCircle
} from 'lucide-react';
import { NotificationsDropdown } from '../../components/NotificationsDropdown';
import type { HeaderProps } from '../../types/Types';
import { useGetNotificationsQuery } from '../../store/api/notifiApi';
import { useGetProfileQuery } from '../../store/api/profileApi';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';


const ActionButton = styled(IconButton)(() => ({
  color: '#64748b',
  borderRadius: '12px',
  padding: '8px',
  border: '1px solid #E5E7EB'
}));

const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  backgroundColor: '#F3F4F6',
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  maxWidth: '400px',
  display: 'flex',
  alignItems: 'center',
  padding: '2px 12px',
  transition: 'all 0.2s',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const SearchIconWrapper = styled('div')(() => ({
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#9CA3AF',
  marginRight: '8px',
}));

const StyledInputBase = styled('input')(() => ({
  border: 'none',
  outline: 'none',
  backgroundColor: 'transparent',
  padding: '10px 0',
  fontSize: '14px',
  width: '100%',
  color: '#1F2937',

}));


const Header: FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const isProfileOpen = Boolean(anchorEl);

  const { data: notifData, error, isLoading, refetch } = useGetNotificationsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { data: profileResponse } = useGetProfileQuery(undefined, {
    refetchOnMountOrArgChange: true
  });
  const { isConnected, isUserActive } = useSocket();
  const user = profileResponse?.data;

  const unreadCount = notifData?.data.unreadCount || 0;

  console.log('Header Rendered');
  console.log('Notification Data:', notifData);
  console.log('Notification Error:', error);
  console.log('Notification Loading:', isLoading);

  useEffect(() => {
    console.log('Header Component Mounted');
  }, []);

  const handleProfileClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleNotifClick = (event: MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
    refetch();
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleProfileClose();
    setIsLogoutDialogOpen(true);
  };

  const { logout } = useAuth();

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
    toast.success('Logout successful');
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#fff',
        color: '#1F2937',
        boxShadow: 'none',
        borderBottom: '1px solid #F3F4F6',
        height: '90px',
        justifyContent: 'center',
        zIndex: (theme) => ({ xs: theme.zIndex.appBar, md: theme.zIndex.drawer + 1 }),
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 4 }, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 1, display: { lg: 'none' } }}
          >
            <MenuIcon size={24} />
          </IconButton>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                color: '#1F2937',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: { xs: '150px', sm: '300px', md: 'auto' },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Admin Console
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                display: { xs: 'none', sm: 'block' },
                fontSize: '12px'
              }}
            >
              Manage your organization, team members, and workspace settings.
            </Typography>
          </Box>
        </Box>

        <SearchContainer sx={{ display: { xs: 'none', lg: 'flex' } }}>
          <SearchIconWrapper>
            <Search size={18} />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search anything..."
            aria-label="search"
          />
        </SearchContainer>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: '15px' }}>
            <ActionButton aria-label="Support">
              <Headphones size={20} />
            </ActionButton>

            <ActionButton aria-label="Notifications" onClick={handleNotifClick}>
              <Badge
                badgeContent={unreadCount}
                color="error"
                sx={{ '& .MuiBadge-badge': { fontWeight: 700 } }}
              >
                <Bell size={20} />
              </Badge>
            </ActionButton>

            <NotificationsDropdown
              notifications={notifData?.data?.notifications || []}
              anchorEl={notifAnchorEl}
              onClose={handleNotifClose}
            />

            <ActionButton aria-label="Video Tutorials">
              <Video size={20} />
            </ActionButton>
          </Box>

          <Box
            onClick={handleProfileClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              p: '6px 12px 6px 6px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: '#F9FAFB',
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: isConnected && isUserActive ? '#10B981' : '#94A3B8',
                  color: isConnected && isUserActive ? '#10B981' : '#94A3B8',
                  boxShadow: '0 0 0 2px #fff',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  '&::after': {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    animation: isUserActive ? 'ripple 1.2s infinite ease-in-out' : 'none',
                    border: '1px solid currentColor',
                    content: '""',
                  },
                },
                '@keyframes ripple': {
                  '0%': { transform: 'scale(.8)', opacity: 1 },
                  '100%': { transform: 'scale(2.4)', opacity: 0 },
                },
              }}
            >
              <Avatar
                src={user?.profilePicture || undefined}
                sx={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #2463EB 0%, #1E40AF 100%)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </Badge>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1F2937', lineHeight: 1.2 }}>
                {user?.name || 'User'}
              </Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '-0.025em' }}>
                {user?.roles?.[0]?.name?.replace('ROLE_', '').replace('_', ' ') || 'Team Admin'}
              </Typography>
            </Box>
            <ChevronDown
              size={16}
              style={{
                color: '#9CA3AF',
                transform: isProfileOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={isProfileOpen}
            onClose={handleProfileClose}
            onClick={handleProfileClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                width: 224,
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid #F3F4F6',
                '& .MuiMenuItem-root': {
                  fontSize: '0.875rem',
                  py: 1.25,
                  px: 2,
                  gap: 1.5,
                  color: '#4B5563',
                  '&:hover': { backgroundColor: '#F9FAFB' },
                  '& .lucide': { color: '#9CA3AF' },
                },
              },
            }}
          >
            <MenuItem onClick={() => navigate('/admin/profile')}>
              <User size={18} /> My Profile
            </MenuItem>
            <Divider sx={{ mx: 2, my: '8px !important' }} />
            <MenuItem
              onClick={handleLogoutClick}
              sx={{ color: '#EF4444 !important', fontWeight: 600 }}
            >
              <LogOut size={18} /> Logout
            </MenuItem>
          </Menu>

          <Dialog
            open={isLogoutDialogOpen}
            onClose={() => setIsLogoutDialogOpen(false)}
            PaperProps={{
              sx: { borderRadius: '16px', p: 1, width: '400px' }
            }}
          >
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{
                width: 56, height: 56, borderRadius: '50%',
                backgroundColor: '#FEF2F2', color: '#EF4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2
              }}>
                <AlertCircle size={28} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#1E293B' }}>
                Confirm Logout
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                Are you sure you want to log out of your account? You will need to sign in again to access your workspace.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <MuiButton
                  fullWidth
                  onClick={() => setIsLogoutDialogOpen(false)}
                  sx={{
                    py: 1.5, borderRadius: '12px', color: '#64748B',
                    fontWeight: 700, textTransform: 'none', backgroundColor: '#F1F5F9',
                    '&:hover': { backgroundColor: '#E2E8F0' }
                  }}
                >
                  Cancel
                </MuiButton>
                <MuiButton
                  fullWidth
                  variant="contained"
                  onClick={handleLogoutConfirm}
                  sx={{
                    py: 1.5, borderRadius: '12px', backgroundColor: '#EF4444',
                    fontWeight: 700, textTransform: 'none',
                    '&:hover': { backgroundColor: '#DC2626' }
                  }}
                >
                  Logout
                </MuiButton>
              </Box>
            </Box>
          </Dialog>
        </Box>
      </Toolbar>
    </AppBar >
  );
};

export default Header;
