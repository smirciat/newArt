'use strict';

angular.module('node10App.auth', ['node10App.constants', 'node10App.util', 'ngCookies',
    'ui.router'])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
