export const CONSTANTS = {
    APP_NAME: 'BlueCollar',
    API_BASE_URL: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api` : 'http://localhost:5000/api',

    ROLES: {
        ADMIN: 'ADMIN',
        APPLICANT: 'APPLICANT',
    },

    ROUTES: {
        HOME: '/',
        LOGIN: '/login',
        REGISTER: '/register',
        VERIFY_EMAIL: '/verify-email',
        FORGOT_PASSWORD: '/forgot-password',
        RESET_PASSWORD: '/reset-password',
        PRIVACY: '/privacy',
        ABOUT: '/about',
        TERMS: '/terms',
        COMPLIANCE: '/compliance',
        SUPPORT: '/support',
        PUBLIC_JOBS: '/jobs',
        DASHBOARD: '/dashboard',
        APPLICATIONS: '/dashboard/applications',
        CV: '/dashboard/cv',
        NOTIFICATIONS: '/dashboard/notifications',
        PROFILE: '/dashboard/profile',
        JOBS: '/dashboard/jobs',
        ADMIN: {
            DASHBOARD: '/admin',
            APPLICATIONS: '/admin/applications',
            HEALTH: '/admin/health',
            JOBS: '/admin/jobs',
            CATEGORIES: '/admin/categories',
            BENEFITS: '/admin/benefits',
            CONDITIONS: '/admin/conditions',
            BANK_ACCOUNTS: '/admin/bank-accounts',
            NEW_APPS: '/admin/applications/new',
            DRAFTS: '/admin/applications/drafts',
            UNPAID: '/admin/payments/unpaid',
            UNVERIFIED: '/admin/payments/unverified',
            MAIL: '/admin/mail',
            REGISTER: '/register/admin',
        }

    },

    STATUSES: {
        PAYMENT: {
            PENDING: 'Pending',
            VERIFIED: 'Verified',
            REJECTED: 'Rejected',
            PAID: 'Paid',
            UNPAID: 'Unpaid',
        },
        APPLICATION: {
            DRAFT: 'Draft',
            ACTIVE: 'Active',
            COMPLETED: 'Completed',
            REJECTED: 'Rejected',
        }
    },

    FILE_CONSTRAINTS: {
        CV_LIMIT_MB: 5,
        PAYMENT_LIMIT_MB: 10,
    },

    BANK_ACCOUNT_TYPES: {
        OPEN_BENEFICIARY: 'Open Beneficiary',
        NORMAL: 'Normal',
    }
};
