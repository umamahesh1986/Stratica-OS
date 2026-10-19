import type { UserRole } from '@/types/auth';
import type { IconName } from '@/types/operations';

export type SectionId =
  | 'companies'
  | 'distributors'
  | 'field-representatives'
  | 'merchants'
  | 'products'
  | 'supply-orders'
  | 'merchant-orders'
  | 'deliveries'
  | 'live-tracking'
  | 'finance'
  | 'reports'
  | 'users'
  | 'settings'
  | 'incoming-orders'
  | 'dispatches'
  | 'distributor-network'
  | 'company-profile'
  | 'inventory'
  | 'field-team'
  | 'tasks'
  | 'team-tracking'
  | 'purchase-sales-reports'
  | 'shops'
  | 'visit'
  | 'new-order'
  | 'my-orders'
  | 'visit-history'
  | 'location'
  | 'notifications'
  | 'profile';

export type SectionDefinition = {
  id: SectionId;
  title: string;
  description: string;
  icon: IconName;
  permission: string;
  resource: string;
  actions?: readonly { id: string; label: string; permission: string }[];
  createAction?: { id: string; label: string; permission: string };
};

const define = (
  id: SectionId,
  title: string,
  description: string,
  icon: IconName,
  permission: string,
  resource: string = id,
  actions?: SectionDefinition['actions'],
  createAction?: SectionDefinition['createAction'],
): SectionDefinition => ({ id, title, description, icon, permission, resource, actions, createAction });

export const roleSections: Record<UserRole, readonly SectionDefinition[]> = {
  STRATICS_ADMIN: [
    define('companies', 'Product companies', 'Manage product company accounts and requests.', 'briefcase', 'companies.read', 'product-companies', [
      { id: 'update', label: 'Update company', permission: 'companies.update' },
    ], { id: 'create', label: 'Add company', permission: 'companies.create' }),
    define('distributors', 'Distributors', 'Review distributor network and account status.', 'truck', 'distributors.read', 'distributors', [
      { id: 'update', label: 'Update distributor', permission: 'distributors.update' },
    ], { id: 'create', label: 'Add distributor', permission: 'distributors.create' }),
    define('field-representatives', 'Field representatives', 'Directory and field team assignments.', 'users', 'field-representatives.read', 'field-representatives', [
      { id: 'update', label: 'Update representative', permission: 'field-representatives.update' },
    ], { id: 'create', label: 'Add representative', permission: 'field-representatives.create' }),
    define('merchants', 'Merchant directory', 'Search and review merchant accounts.', 'shopping-bag', 'merchants.read', 'merchants', [
      { id: 'update', label: 'Update merchant', permission: 'merchants.update' },
    ], { id: 'create', label: 'Add merchant', permission: 'merchants.create' }),
    define('products', 'Product catalogue', 'Review products and catalogue requests.', 'package', 'products.read', 'products', [
      { id: 'update', label: 'Update product', permission: 'products.update' },
    ], { id: 'create', label: 'Add product', permission: 'products.create' }),
    define('supply-orders', 'Supply orders', 'Track company-to-distributor supply orders.', 'archive', 'supply-orders.read'),
    define('merchant-orders', 'Merchant orders', 'Monitor distributor merchant orders.', 'shopping-cart', 'merchant-orders.read'),
    define('deliveries', 'Delivery management', 'Review delivery assignments and progress.', 'map', 'deliveries.read'),
    define('live-tracking', 'Authorized location tracking', 'View authorized live and last-known team locations.', 'crosshair', 'location.read'),
    define('finance', 'Financial overview', 'Review financial summaries provided by the service.', 'credit-card', 'finance.read'),
    define('reports', 'Reports', 'View operational and business reports.', 'bar-chart-2', 'reports.read'),
    define('users', 'User management', 'Manage access requests and user accounts.', 'user-check', 'users.read'),
    define('settings', 'Settings', 'Manage organization-level configuration.', 'settings', 'settings.read'),
  ],
  PRODUCT_COMPANY_ADMIN: [
    define('products', 'My products', 'Review products and submit catalogue requests.', 'package', 'products.read', 'products', [{ id: 'request-review', label: 'Request review', permission: 'products.request' }], { id: 'product-request', label: 'Request a product', permission: 'products.request' }),
    define('incoming-orders', 'Incoming orders', 'Review supply orders from authorized distributors.', 'inbox', 'incoming-orders.read', 'supply-orders', [
      { id: 'accept', label: 'Accept order', permission: 'incoming-orders.accept' },
      { id: 'reject', label: 'Reject order', permission: 'incoming-orders.reject' },
    ]),
    define('dispatches', 'Dispatch management', 'Track accepted orders through dispatch.', 'truck', 'dispatches.read'),
    define('distributor-network', 'Distributor network', 'View your authorized distributor network.', 'share-2', 'distributor-network.read'),
    define('reports', 'Reports', 'Review company product and order reporting.', 'bar-chart-2', 'reports.read'),
    define('notifications', 'Notifications', 'Review account and order updates.', 'bell', 'notifications.read'),
    define('company-profile', 'Company profile', 'View and update organization profile details.', 'briefcase', 'company-profile.read', 'company-profile', [
      { id: 'update', label: 'Edit company profile', permission: 'company-profile.update' },
    ]),
  ],
  DISTRIBUTOR_ADMIN: [
    define('inventory', 'Product inventory', 'Review on-hand stock and audited movement history.', 'archive', 'inventory.read', 'inventory', [
      { id: 'movement', label: 'Record stock movement', permission: 'inventory.movement.create' },
    ], { id: 'movement', label: 'Record stock movement', permission: 'inventory.movement.create' }),
    define('supply-orders', 'Supply orders', 'Manage incoming and outgoing supply orders.', 'inbox', 'supply-orders.read'),
    define('merchant-orders', 'Merchant orders', 'Review orders received from merchants.', 'shopping-cart', 'merchant-orders.read'),
    define('merchants', 'Merchant management', 'Manage merchant accounts and service areas.', 'shopping-bag', 'merchants.read', 'merchants', [
      { id: 'update', label: 'Update merchant', permission: 'merchants.update' },
    ], { id: 'create', label: 'Add merchant', permission: 'merchants.create' }),
    define('field-team', 'Field representative team', 'Review your assigned field team.', 'users', 'field-team.read'),
    define('tasks', 'Task assignments', 'Assign and track field work.', 'check-square', 'tasks.read', 'tasks', [
      { id: 'assign', label: 'Assign task', permission: 'tasks.assign' },
    ], { id: 'assign', label: 'Assign task', permission: 'tasks.assign' }),
    define('deliveries', 'Delivery management', 'Review route and delivery progress.', 'map', 'deliveries.read'),
    define('team-tracking', 'Team tracking', 'View authorized last-known team locations.', 'crosshair', 'team-tracking.read'),
    define('purchase-sales-reports', 'Purchase and sales reports', 'Review distributor purchase and sales summaries.', 'bar-chart-2', 'purchase-sales-reports.read'),
    define('notifications', 'Notifications', 'Review distributor updates and alerts.', 'bell', 'notifications.read'),
    define('settings', 'Profile and settings', 'Review account and notification preferences.', 'settings', 'settings.read'),
  ],
  FIELD_REPRESENTATIVE: [
    define('tasks', 'Today’s assigned work', 'View and complete today’s assigned work.', 'check-square', 'tasks.read'),
    define('shops', 'My shops', 'View assigned merchants and visit notes.', 'shopping-bag', 'shops.read', 'merchants'),
    define('visit', 'Visit check-in / check-out', 'Record a visit with permission and accuracy details.', 'map-pin', 'visits.write', 'visits'),
    define('new-order', 'New merchant order', 'Prepare and review an order for a merchant.', 'plus-square', 'merchant-orders.create', 'merchant-orders', undefined, { id: 'create', label: 'Submit order', permission: 'merchant-orders.create' }),
    define('my-orders', 'My orders', 'Review orders submitted on your visits.', 'shopping-cart', 'merchant-orders.read'),
    define('deliveries', 'Assigned deliveries', 'Review delivery work and confirm completion.', 'truck', 'deliveries.read', 'deliveries', [
      { id: 'confirm-delivery', label: 'Confirm delivery', permission: 'deliveries.confirm' },
    ]),
    define('visit-history', 'Visit history', 'Review your previous visit check-ins.', 'clock', 'visits.read', 'visits'),
    define('location', 'Location tracking status', 'Review location permission and report freshness.', 'crosshair', 'location.self.read', 'locations'),
    define('notifications', 'Notifications', 'Review field assignment updates.', 'bell', 'notifications.read'),
    define('profile', 'Profile', 'View your account and sign out.', 'user', 'profile.read', 'profile'),
  ],
};

export function getSection(role: UserRole, id: string): SectionDefinition | undefined {
  return roleSections[role].find((section) => section.id === id);
}
