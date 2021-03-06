'use strict';
/*jshint -W069 */

require("angular");
require("angular-route");
require('angular-bootstrap');

/**
 * Idea from https://github.com/thedigitalself/angular-sprout
 * The application file bootstraps the angular app by  initializing the main module and
 * creating namespaces and moduled for controllers, filters, services, and directives.
 */

var httpHeaders;
var originalLocation = "/login";

/**
 * ui.bootstrap is from angular-bootstrap
 * It is being use to do the accordion for the Address
 */
var app = angular.module('application', [ 'ngRoute','ui.bootstrap']);

/**
 * Idea from http://ardeibert.com/modularizing-an-angularjs-app-with-browserify/
 */
require("./security/AuthService")(app);
require("./signup/SignupCtrl")(app);
require("./login/LoginCtrl")(app);
require("./home/HomeCtrl")(app);

app.config(['$routeProvider', '$locationProvider', function( $routeProvider, $locationProvider ){

    $routeProvider
        .when('/login',{
            title:'Login',
            templateUrl:'login.html',
            controller:"LoginCtrl"
        })
        .when('/home',{
            title:'Home',
            templateUrl:'home.html',
            controller:"HomeCtrl"
        })
        .when('/userform',{
            title:'User Settings',
            templateUrl:'userSettings.tpl',
            controller:"UserSettingsCtrl"
        })
        .when('/updatePassword',{
            title:'Update Your Password',
            templateUrl:'updatePassword.tpl',
            controller:null
        })
        .when('/signup',{
          title:'Sign Up',
          templateUrl:'signup.html',
          controller:'SignupCtrl'
        })
        .otherwise({
            redirectTo: '/login'
        });

    $locationProvider.html5Mode(true);
}]);

app.controller('UserSettingsCtrl', ['$scope',function($scope){
    $scope.oneAtATime = true;
    $scope.status = {
        isFirstOpen: false,
        isFirstDisabled: false
    };
}]);

app.controller('NavCtrl', ['$scope', "$location", "$rootScope", 'AuthService', function( $scope, $location, $rootScope, AuthService )
{

  $scope.logout = function () {
    AuthService.logout( $scope ).then(function() {
      $scope.username = $scope.password = null;
      $scope.user = null;
      $location.path("/");
    });
  };

}]);

/**
 * This part will change the html's header title
 */
app.run(['$location', '$rootScope', '$http', function( $location, $rootScope, $http ) {

  /**
   * Holds all the requests which failed due to 401 response.
   */
  $rootScope.requests401 = [];

  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    if( current.$$route )
    {
      $rootScope.title = current.$$route.title;
    }
  });

  $rootScope.$on('event:loginRequired', function () {
    $rootScope.requests401 = [];

    if ($location.path().indexOf("/login") == -1) {
      originalLocation = $location.path();

      $rootScope.error = "Please enter a valid username / password";
    }

    $location.path('/login');
  });

  /**
   * On 'event:loginConfirmed', resend all the 401 requests.
   */
  $rootScope.$on('event:loginConfirmed', function () {
    var i,
        requests = $rootScope.requests401,
        retry = function (req) {
          $http(req.config).then(function (response) {
            req.deferred.resolve(response);
          });
        };

    for (i = 0; i < requests.length; i += 1) {
      retry(requests[i]);
    }
    $rootScope.requests401 = [];
  });

  /**
   * On 'logoutRequest' invoke logout on the server.
   */
  /**
  $rootScope.$on('event:logoutRequest', function () {
    httpHeaders.common['Authorization'] = null;
    originalLocation = "/login";
  });
  **/

  httpHeaders = $http.defaults.headers;

}]);



