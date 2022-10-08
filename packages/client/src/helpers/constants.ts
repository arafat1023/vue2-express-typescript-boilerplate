const CONSTANTS = {
  LOGS: {
    INFO: 'log-info',
  } as const,
  ROUTES: {
    GUEST_HOME: '/',
    MEMBER_HOME: '/',
    ADMIN_HOME: '/admin/user-list',
  } as const,
} as const;

export default CONSTANTS;
