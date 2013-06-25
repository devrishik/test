var app, compound
, request = require('supertest')
, sinon   = require('sinon');

function TestStub () {
    return {
        name: ''
    };
}

describe('TestController', function() {
    beforeEach(function(done) {
        app = getApp();
        compound = app.compound;
        compound.on('ready', function() {
            done();
        });
    });

    /*
     * GET /tests/new
     * Should render tests/new.ejs
     */
    it('should render "new" template on GET /tests/new', function (done) {
        request(app)
        .get('/tests/new')
        .end(function (err, res) {
            res.statusCode.should.equal(200);
            app.didRender(/tests\/new\.ejs$/i).should.be.true;
            done();
        });
    });

    /*
     * GET /tests
     * Should render tests/index.ejs
     */
    it('should render "index" template on GET /tests', function (done) {
        request(app)
        .get('/tests')
        .end(function (err, res) {
            res.statusCode.should.equal(200);
            app.didRender(/tests\/index\.ejs$/i).should.be.true;
            done();
        });
    });

    /*
     * GET /tests/:id/edit
     * Should access Test#find and render tests/edit.ejs
     */
    it('should access Test#find and render "edit" template on GET /tests/:id/edit', function (done) {
        var Test = app.models.Test;

        // Mock Test#find
        Test.find = sinon.spy(function (id, callback) {
            callback(null, new Test);
        });

        request(app)
        .get('/tests/42/edit')
        .end(function (err, res) {
            res.statusCode.should.equal(200);
            Test.find.calledWith('42').should.be.true;
            app.didRender(/tests\/edit\.ejs$/i).should.be.true;

            done();
        });
    });

    /*
     * GET /tests/:id
     * Should render tests/index.ejs
     */
    it('should access Test#find and render "show" template on GET /tests/:id', function (done) {
        var Test = app.models.Test;

        // Mock Test#find
        Test.find = sinon.spy(function (id, callback) {
            callback(null, new Test);
        });

        request(app)
        .get('/tests/42')
        .end(function (err, res) {
            res.statusCode.should.equal(200);
            Test.find.calledWith('42').should.be.true;
            app.didRender(/tests\/show\.ejs$/i).should.be.true;

            done();
        });
    });

    /*
     * POST /tests
     * Should access Test#create when Test is valid
     */
    it('should access Test#create on POST /tests with a valid Test', function (done) {
        var Test = app.models.Test
        , test = new TestStub;

        // Mock Test#create
        Test.create = sinon.spy(function (data, callback) {
            callback(null, test);
        });

        request(app)
        .post('/tests')
        .send({ "Test": test })
        .end(function (err, res) {
            res.statusCode.should.equal(302);
            Test.create.calledWith(test).should.be.true;

            done();
        });
    });

    /*
     * POST /tests
     * Should fail when Test is invalid
     */
    it('should fail on POST /tests when Test#create returns an error', function (done) {
        var Test = app.models.Test
        , test = new TestStub;

        // Mock Test#create
        Test.create = sinon.spy(function (data, callback) {
            callback(new Error, test);
        });

        request(app)
        .post('/tests')
        .send({ "Test": test })
        .end(function (err, res) {
            res.statusCode.should.equal(200);
            Test.create.calledWith(test).should.be.true;

            app.didFlash('error').should.be.true;

            done();
        });
    });

    /*
     * PUT /tests/:id
     * Should redirect back to /tests when Test is valid
     */
    it('should redirect on PUT /tests/:id with a valid Test', function (done) {
        var Test = app.models.Test
        , test = new TestStub;

        Test.find = sinon.spy(function (id, callback) {
            callback(null, {
                id: 1,
                updateAttributes: function (data, cb) { cb(null) }
            });
        });

        request(app)
        .put('/tests/1')
        .send({ "Test": test })
        .end(function (err, res) {
            res.statusCode.should.equal(302);
            res.header['location'].should.include('/tests/1');

            app.didFlash('error').should.be.false;

            done();
        });
    });

    /*
     * PUT /tests/:id
     * Should not redirect when Test is invalid
     */
    it('should fail / not redirect on PUT /tests/:id with an invalid Test', function (done) {
        var Test = app.models.Test
        , test = new TestStub;

        Test.find = sinon.spy(function (id, callback) {
            callback(null, {
                id: 1,
                updateAttributes: function (data, cb) { cb(new Error) }
            });
        });

        request(app)
        .put('/tests/1')
        .send({ "Test": test })
        .end(function (err, res) {
            res.statusCode.should.equal(200);
            app.didFlash('error').should.be.true;

            done();
        });
    });

    /*
     * DELETE /tests/:id
     * -- TODO: IMPLEMENT --
     */
    it('should delete a Test on DELETE /tests/:id');

    /*
     * DELETE /tests/:id
     * -- TODO: IMPLEMENT FAILURE --
     */
    it('should not delete a Test on DELETE /tests/:id if it fails');
});
