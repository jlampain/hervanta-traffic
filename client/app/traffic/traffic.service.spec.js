'use strict';

describe('Service: traffic', function () {

  // load the service's module
  beforeEach(module('hervantaTrafficApp'));

  // instantiate service
  var traffic;
  beforeEach(inject(function (_traffic_) {
    traffic = _traffic_;
  }));

  it('should do something', function () {
    expect(!!traffic).toBe(true);
  });

});
