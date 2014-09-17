var request = require('request');
describe('Temp api endpoint', function() {
    it("should respond with 7", function(done) {
        request("http://localhost:40000/temp/7.0/", function(error, response, body) {
            expect(body).toEqual("7");
            done();
        });
    });
});