var nodespec = require('nodespec');

nodespec.mockWith('sinon');

nodespec.describe("present-express", function() {
    this.subject('module', function() {
        return require('./index');
    })
    this.describe("init", function(it) {
        this.subject('args', function() {
            return { templates: './templates' }
        })
        it("should create engine function", function() {
            var func = this.module.init(this.args);
            this.assert.equal(typeof func, 'function');
        })
        it("should fail if templates not set", function() {
            try {
                this.module.init({});
            } catch (ex) {
                this.assert.ok(ex instanceof Error);
                this.assert.ok(/not specified/.test(ex.message))
            }
        })
    })
    this.describe("engine", function(it) {
        this.before(function() {
            this.require = this.sinon.stub(this.module.deps, 'require');
        })
        it("should require the presenter file")
        it("should handle error in require")
        it("should execute the presenter")
        it("should handle error in presenter")
        it("should read the template file")
        it("should handle error reading file")
        it("should render the template file with presenter data")
        it("should support layouts")
        it("should handle error in layouts")
        it("should handle JSON response")
    })

    this.describe("create", function(it) {
        it("should make a presenter function")
    })

    this.describe("extend", function(it) {
        it("should extend a presenter function")
    })
})

nodespec.exec();
