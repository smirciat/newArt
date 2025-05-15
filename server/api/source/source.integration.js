'use strict';

var app = require('../..');
import request from 'supertest';

var newSource;

describe('Source API:', function() {

  describe('GET /api/sources', function() {
    var sources;

    beforeEach(function(done) {
      request(app)
        .get('/api/sources')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          sources = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(sources).to.be.instanceOf(Array);
    });

  });

  describe('POST /api/sources', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/sources')
        .send({
          name: 'New Source',
          info: 'This is the brand new source!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newSource = res.body;
          done();
        });
    });

    it('should respond with the newly created source', function() {
      expect(newSource.name).to.equal('New Source');
      expect(newSource.info).to.equal('This is the brand new source!!!');
    });

  });

  describe('GET /api/sources/:id', function() {
    var source;

    beforeEach(function(done) {
      request(app)
        .get('/api/sources/' + newSource._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          source = res.body;
          done();
        });
    });

    afterEach(function() {
      source = {};
    });

    it('should respond with the requested source', function() {
      expect(source.name).to.equal('New Source');
      expect(source.info).to.equal('This is the brand new source!!!');
    });

  });

  describe('PUT /api/sources/:id', function() {
    var updatedSource;

    beforeEach(function(done) {
      request(app)
        .put('/api/sources/' + newSource._id)
        .send({
          name: 'Updated Source',
          info: 'This is the updated source!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedSource = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedSource = {};
    });

    it('should respond with the updated source', function() {
      expect(updatedSource.name).to.equal('Updated Source');
      expect(updatedSource.info).to.equal('This is the updated source!!!');
    });

  });

  describe('DELETE /api/sources/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/sources/' + newSource._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when source does not exist', function(done) {
      request(app)
        .delete('/api/sources/' + newSource._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
