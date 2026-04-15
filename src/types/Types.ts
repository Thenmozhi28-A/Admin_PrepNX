export interface LoginValues {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export interface ForgotEmailValues {
  email: string;
}

export interface NewPasswordValues {
  password: string;
  confirmPassword: string;
}

export interface OTPValues {
  otp: string;
}

export interface OrganizationValues {
  orgName: string;
  email: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string | null;
  permissions?: any[] | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  phone?: string; // fallback if needed
  role?: string; // fallback if needed
  roles: UserRole[];
  active: boolean;
  status: string;
  onlineStatus: string;
  profilePicture: string | null;
  mfaEnabled: boolean;
  createdAt: number;
}

export interface UserPage {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface UserData {
  content: User[];
  page: UserPage;
}

export interface UserResponse {
  statusCode: number;
  message: string;
  data: UserData;
}

export interface PermissionActionState {
  CREATE: boolean;
  READ: boolean;
  UPDATE: boolean;
  DELETE: boolean;
}

export interface Permission {
  id: string;
  module: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  actions: PermissionActionState;
  originalCategory: string; // To keep the original API category
}

export interface PermissionCategory {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface RoleData {
  id: string;
  name?: string;
  description?: string;
  categories: PermissionCategory[];
  createdByRole?: string;
  organisationId?: string | null;
}

export interface ApiPermission {
  id: string;
  module: string;
  label: string;
  description: string;
  category: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface ApiRole {
  id: string;
  name: string;
  description: string;
  permissions: ApiPermission[];
  createdByRole: string;
  organisationId: string | null;
}

export interface PermissionResponse {
  statusCode: number;
  message: string;
  data: ApiPermission[];
}

export interface RolesResponse {
  statusCode: number;
  message: string;
  data: ApiRole[];
}

export interface AuditUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profilePicture: string | null;
  roles: any;
}

export interface AuditLogEntry {
  id: string;
  user: AuditUser;
  action: string;
  ipAddress: string;
  userAgent: string;
  timestamp: number;
}

export interface AuditLogPage {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface AuditLogData {
  content: AuditLogEntry[];
  page: AuditLogPage;
}

export interface AuditLogResponse {
  statusCode: number;
  message: string;
  data: AuditLogData;
}

export interface ProfileFormData {
  fullName: string;
  email: string;
  mobileNumber: string;
}

export interface RoleForm {
  name: string;
  description: string;
}

export interface InviteUserForm {
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: number;
  read?: boolean; // UI state for read/unread if needed
  readReceiptDTOS?: { user: any; read: boolean; readAt: number }[];
}

export interface HeaderProps {
  onMenuClick?: () => void;
}

export interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export interface NotificationData {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
}

export interface NotificationResponse {
  statusCode: number;
  message: string;
  data: NotificationData;
}

export interface NotificationsPopoverProps {
  notifications: Notification[];
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export interface OrgType {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  category: string | null;
  logoUrl: string | null;
}

export interface PricePlan {
  id: string;
  name: string;
  price: number;
  planType: string;
  features: string[];
  userCount: number;
  category: string;
  maxTeams: number | null;
  maxStorageGB: number;
  days: number;
  expiryDate: number;
  active: boolean;
  products: Product[];
  default: boolean;
}

export interface Organization {
  id: string;
  name: string;
  workspaceUrl: string;
  brandColor: string | null;
  logoUrl: string;
  type: OrgType;
  status: string;
  pricePlan: PricePlan;
  currentStorageGB: number;
  paymentMethod: string | null;
  paymentStatus: string | null;
  verifiedDomains: string[] | null;
  ssoEnabled: boolean;
  guestAccessAllowed: boolean;
  totalUsers: number;
  email: string;
  mobileNumber: string | null;
}

export interface OrganizationResponse {
  statusCode: number;
  message: string;
  data: Organization;
}

export interface BillingResponseData {
  pricePlan: PricePlan;
  usageUsers: number;
  usageTeams: number;
  usageStorageGB: number;
  paymentMethod: string | null;
  paymentStatus: string | null;
  billingAmount: number;
  billingHistory: any[];
}

export interface BillingResponse {
  statusCode: number;
  message: string;
  data: BillingResponseData;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: string;
  organisationId: string | null;
  lastModified: number;
  default: boolean;
}

export interface EmailTemplateResponse {
  statusCode: number;
  message: string;
  data: EmailTemplate[];
}

export interface ProfileResponse {
  statusCode: number;
  message: string;
  data: User;
}
