import type { FC } from 'react';
import { Typography, styled } from '@mui/material';
import type { TypographyProps } from '@mui/material';

const StyledLabel = styled(Typography)<TypographyProps>(() => ({
  marginBottom: '8px',
  fontWeight: 540,
  color: '#374151',
  display: 'block',
  fontSize: '14px',
}));

export const Label: FC<TypographyProps & { htmlFor?: string }> = (props) => {
  return <StyledLabel variant="body2" component="label" {...props} />;
};

export default Label;
