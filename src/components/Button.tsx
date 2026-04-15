import type { FC } from 'react';
import { Button as MuiButton, styled } from '@mui/material';
import type { ButtonProps } from '@mui/material';

const StyledButton = styled(MuiButton)(() => ({
  textTransform: 'none',
  borderRadius: '8px',
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: '1rem',
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(36, 99, 235, 0.2)',
  },
  '&.MuiButton-containedPrimary': {
    background: 'linear-gradient(90deg, #2463EB 0%, #1E40AF 100%)',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(90deg, #1D4ED8 0%, #1E3A8A 100%)',
    },
    '&:disabled': {
      opacity: 0.7,
      color: 'rgba(255, 255, 255, 0.8)',
    },
  },
  '&.MuiButton-outlinedPrimary': {
    borderColor: '#E5E7EB',
    color: '#6B7280',
    '&:hover': {
      borderColor: '#2463EB',
      backgroundColor: '#F9FAFB',
      color: '#2463EB',
    },
  },
}));

export const Button: FC<ButtonProps> = (props) => {
  return <StyledButton {...props} />;
};

export default Button;
