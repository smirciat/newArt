'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var sourceCtrlStub = {
  index: 'sourceCtrl.index',
  show: 'sourceCtrl.show',
  create: 'sourceCtrl.create',
  update: 'sourceCtrl.update',
  destroy: 'sourceCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var sourceIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './source.controller': sourceCtrlStub
});

describe('Source API Router:', function() {

  it('should return an express router instance', function() {
    expect(sourceIndex).to.equal(routerStub);
  });

  describe('GET /api/sources', function() {

    it('should route to source.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'sourceCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /api/sources/:id', function() {

    it('should route to source.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'sourceCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /api/sources', function() {

    it('should route to source.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'sourceCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /api/sources/:id', function() {

    it('should route to source.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'sourceCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('PATCH /api/sources/:id', function() {

    it('should route to source.controller.update', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'sourceCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /api/sources/:id', function() {

    it('should route to source.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'sourceCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
