var auth = require('../../client/app/controllers/auth.js');

describe('AuthCtrl', function() {
  beforeEach(angular.mock.module('app'));

  var $controller;

  beforeEach(angular.mock.inject(function(_$controller_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  describe('validateSignup', function() {
    it('returns false if non-word characters are input', function() {
      var data = '%ghu&*{}';
      var isValid = validateSignup(data);
      expect(isValid).toEqual(false);



      // var $scope = {};
      // var controller = $controller('PasswordController', { $scope: $scope });
      // $scope.password = 'longerthaneightchars';
      // $scope.grade();
      // expect($scope.strength).toEqual('strong');
    });
  });
});
