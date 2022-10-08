import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import { CONSTANTS } from '@/helpers';
import store from '@/store';
import LandingPage from '@/views/Common/LandingPage.vue';

Vue.use(VueRouter);

const isGuest = {
  meta: {
    isGuest: true,
  },
};

const isCommon = {
  meta: {
    isCommon: true,
  },
};

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: LandingPage,
    ...isCommon,
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import(/* webpackChunkName: "auth" */ '../views/Auth/Auth.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        ...isGuest,
        component: () => import(/* webpackChunkName: "login" */ '../views/Auth/Login.vue'),
      },
      {
        path: 'signup',
        name: 'SignUp',
        ...isGuest,
        component: () => import(/* webpackChunkName: "signup" */ '../views/Auth/SignUp.vue'),
      },
      {
        path: 'reset/:id?',
        name: 'ResetPassword',
        component: () => import(/* webpackChunkName: "reset-password" */ '../views/Auth/ResetPassword.vue'),
        ...isGuest,
      },
      {
        path: 'verify',
        name: 'Verify',
        component: () => import(/* webpackChunkName: "verify-email" */ '../views/Auth/VerifyEmail.vue'),
        ...isGuest,
      },
      {
        path: '/verify-email/:token',
        name: 'VerifyEmail',
        component: () => import(/* webpackChunkName: "verify-email-landing" */ '../views/Auth/VerifyEmailLanding.vue'),
        ...isGuest,
      },
    ],
  },
  {
    path: '/login/google',
    name: 'GoogleLogin',
    ...isGuest,
    component: () => import(/* webpackChunkName: "google-login" */ '../views/Auth/GoogleLogin.vue'),
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: () => import(/* webpackChunkName: "privacy-policy" */ '../views/Common/PrivacyPolicy.vue'),
    ...isCommon,
  },
  {
    path: '/terms-of-service',
    name: 'TermsOfService',
    component: () => import(/* webpackChunkName: "terms-of-service" */ '../views/Common/TermsOfService.vue'),
    ...isCommon,
  },
  {
    path: '/unsubscribe',
    name: 'Unsubscribe',
    component: () => import(/* webpackChunkName: "unsubscribe" */ '../views/Common/Unsubscribe.vue'),
    ...isCommon,
  },
  {
    path: '/user',
    name: 'User',
    component: () => import(/* webpackChunkName: "user" */ '../views/NonAdmin/User.vue'),
    children: [
      {
        path: 'account',
        name: 'Account',
        component: () => import(/* webpackChunkName: "account" */ '../views/NonAdmin/Account.vue'),
      },
    ],
  },
  {
    path: '/admin',
    name: 'AdminTemplate',
    component: () => import(/* webpackChunkName: "admin-template" */ '../views/Admin/AdminTemplate.vue'),
    children: [
      {
        path: 'user-list',
        name: 'UserList',
        component: () => import(/* webpackChunkName: "admin-user-list" */ '../views/Admin/UserList.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => (import(/* webpackChunkName: "admin-mutate-settings" */ '../views/Admin/MutateSettings.vue')),
      },
    ],
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

// ensuring user load from local storage attempted before routing
router.beforeEach(async (to, from, next) => {
  const prevRoutePath = from.fullPath;
  await store.dispatch('init', { prevRoutePath });
  next();
});

router.beforeResolve((to, from, next) => {
  if (!store.state.user && !to.meta?.isGuest && !to.meta?.isCommon) {
    next(`/auth/${from.meta?.isCommon ? 'signup' : 'login'}?redirect=${encodeURIComponent(to.fullPath)}`);
    return;
  }
  if (to.fullPath.startsWith('/admin')) {
    if (store.state.user?.role === 'admin') {
      next();
    } else {
      next(CONSTANTS.ROUTES.ADMIN_HOME);
    }
  } else if (store.state.user?.role === 'admin') {
    // if logged, admin goes to non admin page
    next(CONSTANTS.ROUTES.ADMIN_HOME);
  } else if (store.state.user?.role === 'non-admin' && to.meta?.isGuest) {
    next(CONSTANTS.ROUTES.MEMBER_HOME);
  } else {
    next();
  }
});

export default router;
