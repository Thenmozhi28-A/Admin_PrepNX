import React from 'react';
import {
  Box,
  Typography,
  Popover,
  Divider,
  styled,
  Button as MuiButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import type { NotificationsPopoverProps, Notification } from '../types/Types';
import { useMarkAsReadMutation } from '../store/api/notifiApi';

const StyledPopover = styled(Popover)(() => ({
  '& .MuiPaper-root': {
    width: '360px',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #F1F5F9',
    marginTop: '12px',
    overflow: 'hidden',
  },
}));

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'PLAN_EXPIRATION':
      return <AlertTriangle size={18} color="#EF4444" />;
    case 'SUCCESS':
      return <CheckCircle size={18} color="#10B981" />;
    default:
      return <Info size={18} color="#2563EB" />;
  }
};

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${displayHours}:${displayMinutes} ${ampm} ${month}/${day}/${year}`;
};

export const NotificationsDropdown: React.FC<NotificationsPopoverProps> = ({
  notifications,
  anchorEl,
  onClose,
}) => {
  const [markAsRead] = useMarkAsReadMutation();
  const open = Boolean(anchorEl);

  const isRead = (notification: Notification) => {
    if (notification.readReceiptDTOS && notification.readReceiptDTOS.length > 0) {
      return notification.readReceiptDTOS[0].read;
    }
    return notification.read || false;
  };

  const handleNotificationClick = async (id: string) => {
    console.log('Notification clicked, ID:', id);
    try {
      await markAsRead(id).unwrap();
      console.log('Mark as read success');
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  return (
    <StyledPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1rem' }}>
          Notifications
        </Typography>
        {notifications.length > 0 && (
          <Typography sx={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
            {notifications.length} total
          </Typography>
        )}
      </Box>
      
      <Divider sx={{ borderColor: '#F1F5F9' }} />

      <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
        {notifications.length > 0 ? (
          <List sx={{ p: 0 }}>
            {notifications.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    onClick={() => handleNotificationClick(item.id)}
                    sx={{
                      py: 2,
                      px: 3,
                      alignItems: 'flex-start',
                      backgroundColor: isRead(item) ? 'transparent' : 'rgba(37, 99, 235, 0.04)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: isRead(item) ? '#F8FAFC' : 'rgba(37, 99, 235, 0.08)',
                      }
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: '48px', mt: 0.5 }}>
                      <Avatar sx={{ bgcolor: isRead(item) ? '#F1F5F9' : '#EFF6FF', width: 36, height: 36 }}>
                        {getNotificationIcon(item.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography sx={{ fontWeight: isRead(item) ? 600 : 800, color: '#1E293B', fontSize: '14px' }}>
                            {item.title}
                          </Typography>
                          {!isRead(item) && (
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2563EB' }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography sx={{ color: '#64748B', fontSize: '13px', lineHeight: 1.5, mb: 1 }}>
                            {item.message}
                          </Typography>
                          <Typography sx={{ color: '#94A3B8', fontSize: '11px', fontWeight: 600 }}>
                            {formatTime(item.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                <Divider component="li" sx={{ borderColor: '#F8FAFC' }} />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
            <Box sx={{ mb: 2, color: '#F1F5F9', display: 'flex', justifyContent: 'center' }}>
              <Bell size={48} strokeWidth={1} />
            </Box>
            <Typography sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.875rem' }}>
              No notifications yet
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: '#F1F5F9' }} />
      
      <Box sx={{ p: 1, textAlign: 'center' }}>
        <MuiButton
          fullWidth
          variant="text"
          sx={{
            py: 1,
            color: '#2563EB',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '14px',
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.04)',
            },
          }}
        >
          View All Notifications
        </MuiButton>
      </Box>
    </StyledPopover>
  );
};
