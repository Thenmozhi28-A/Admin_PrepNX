import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  identifier: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const forgotEmailSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

export const newPasswordSchema = yup.object().shape({
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

export const otpSchema = yup.object().shape({
  otp: yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
});

export const organizationSchema = yup.object().shape({
  orgName: yup.string().required('Organization name is required'),
  email: yup.string().email('Invalid email').required('Business email is required'),
});

export const inviteUserSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email Address is required'),
  phone: yup.string().required('Mobile Number is required'),
  role: yup.string().required('Role is required'),
});

export const roleSchema = yup.object().shape({
  name: yup.string().required('Role name is required'),
  description: yup.string().required('Description is required'),
});

export const blockIpSchema = yup.object().shape({
  ip: yup.string().required('IP address is required').matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP Address'),
  reason: yup.string().required('Reason for restriction is required'),
});

export const profileSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  mobileNumber: yup.string().required('Mobile number is required'),
});

export const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmNewPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});
