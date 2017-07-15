module.exports = {
    env: {
        browser: true,
        mocha: true,
        node: true,
        es6: true
    },
    parserOptions: {
        ecmaFeatures: {
            modules: true,
        }
    },
    extends: ["eslint:recommended"],
    rules: {
        indent: ["error", 4],
        "no-useless-escape": ["off"],
    }
}
