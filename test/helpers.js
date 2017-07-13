const svgLoader = require('../');
exports.svgLoader = svgLoader;

function runLoader(loader, filename, input, map, addOptions, callback) {
    var opt = {
        options: {
            context: ""
        },
        callback: callback,
        async: function() {
            return callback;
        },
        loaders: [{request: "/path/preact-svg-loader"}],
        loaderIndex: 0,
        context: "",
        resource: filename,
        resourcePath: filename,
        request: "preact-svg-loader!"+filename,
        emitError: function(message) {
            throw new Error(message);
        }
    };
    Object.keys(addOptions).forEach(function(key) {
        opt[key] = addOptions[key];
    });
    loader.call(opt, input, map);
}

exports.test = (name, filename, input, options, callback) => {
    it(name, done => {
        runLoader(svgLoader, filename, input, null, options, function(err, data) {
            if (err) throw err;
            callback(data);
            done();
        })
    });
};

exports.testVNodes = (name, filename, input, options, callback) => {
    exports.test(name, filename, input, options, parsed => {
        const runnable = parsed.replace(/^[^]*(function[^]*\});[^]*$/, (_, $1) => $1);
        const vnodes = [];
        // these things are used by the "runnable" code chunk:
        /* eslint-disable no-unused-vars */
        const h = (nodeName, attributes, children) => {
            vnodes.push({nodeName, attributes, children})
            return vnodes[vnodes.length - 1];
        };
        const props = options.props || {};
        /* eslint-enable no-unused-vars */
        try {
            eval(`(${runnable})(props)`);
        } catch(e) {
            // eslint-disable-next-line no-console
            console.error('Error testing', runnable);
            throw e;
        }
        callback(vnodes);
    });
};
