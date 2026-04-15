import { forwardRef } from 'react';
import { TextField, styled, Box } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { Label } from './Label';

// const StyledTextField = styled(TextField)(() => ({
//   '& .MuiOutlinedInput-root': {
//     borderRadius: '12px',
//     backgroundColor: '#fff',
//     transition: 'all 0.2s ease',
//     '&:hover': {
//       backgroundColor: '#F9FAFB',
//       '& .MuiOutlinedInput-notchedOutline': {
//         borderColor: '#E5E7EB',
//       },
//       '&.Mui-disabled': {
//         backgroundColor: '#fff',
//       },
//     },
//     '&.Mui-focused': {
//       backgroundColor: '#fff',
//       '& .MuiOutlinedInput-notchedOutline': {
//         borderWidth: '2px',
//         borderColor: '#2463EB',
//       },
//     },
//     '& .MuiOutlinedInput-notchedOutline': {
//       borderColor: '#E5E7EB',
//     },
//   },
//   '& .MuiInputBase-input': {
//     padding: '12px 16px',
//     fontSize: '12px',
//     height: '48px',
//     lineHeight: '24px',
//     color: '#1F2937',
//     '&::placeholder': {
//       color: '#9CA3AF',
//       opacity: 1,
//       fontSize: '14px',
//     },
//   },
// }));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#fff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#D1D5DB',
      },
      '&.Mui-disabled': {
        backgroundColor: '#fff',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#E5E7EB',
        },
      },
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: '2px',
        borderColor: '#2463EB',
      },
    },
    '&.Mui-disabled': {
      backgroundColor: '#fff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#E5E7EB',
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E5E7EB',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px 16px',
    fontSize: '14px',
    height: '48px',
    lineHeight: '24px',
    color: '#1F2937',
    '&::placeholder': {
      color: '#9CA3AF',
      opacity: 1,
      fontSize: '14px',
    },
    '&.Mui-disabled': {
      color: '#6B7280',
      WebkitTextFillColor: '#6B7280',
    },
    '&:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 100px #fff inset !important',
      WebkitTextFillColor: '#1F2937 !important',
    },
  },
}));

interface CustomInputProps extends Omit<TextFieldProps, 'label'> {
  label?: string;
  errorText?: string;
  hideLabel?: boolean;
}

export const Input = forwardRef<HTMLDivElement, CustomInputProps>(
  ({ label, errorText, hideLabel, id: providedId, sx, ...props }, ref) => {
    const id = providedId || `input-${label?.replace(/\s+/g, '-').toLowerCase() || Math.random().toString(36).substr(2, 9)}`;

    return (
      <Box sx={{ mb: 2, width: '100%', ...sx }}>
        {label && !hideLabel && <Label htmlFor={id}>{label}</Label>}
        <StyledTextField
          id={id}
          fullWidth
          error={!!errorText}
          helperText={errorText}
          inputRef={ref}
          autoComplete="one-time-code"
          {...props}
        />
      </Box>
    );
  }
);

Input.displayName = 'Input';

export default Input;
