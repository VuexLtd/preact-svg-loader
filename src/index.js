const loaderUtils = require("loader-utils");
const htmlparser = require("htmlparser");
const defaultOptions = {
    cssModules: true,
    mangleIds: true,
    idPattern: 'svg-[name]-[sha512:hash:base64:7]',
};


const getOptions = context => Object.assign({},
    loaderUtils.getOptions(context),
    defaultOptions
);

function getIdReplacement(context, options, id) {
    return loaderUtils.interpolateName(context, options.idPattern, { content: id }).replace(/[^a-zA-Z0-9]/g,'-');
}

function assembleNode(context, options, node, root) {
    if (node.type === 'text') {
        return JSON.stringify(node.data)
    }

    let useAttribs = Object.assign({}, node.attribs || {});
    if (options.mangleIds) {
        Object.keys(useAttribs).forEach(key => {
        // id="foo" - mangle "foo"
            if (key === 'id') {
                return useAttribs[key] = getIdReplacement(context, options, useAttribs[key]);
            }
            // xlink:href="#foo" or anything href="#foo" -> mangle "foo"
            if (key.toLowerCase().indexOf('href') !== -1) {
                return useAttribs[key] = useAttribs[key].replace(/^#([\w-]+)/, (_, $1) =>
                    `#${getIdReplacement(context, options, $1)}`
                );
            }
            // all other attributes search for url(#foo) -> mangle "foo"
            if (typeof useAttribs[key] === 'string') {
                return useAttribs[key] = useAttribs[key].replace(/url\(#([^\)]+)\)/g, (_, $1) =>
                    `url(#${getIdReplacement(context, options, $1)})`
                );
            }
        })
    }

    let attribs = JSON.stringify(useAttribs);

    if (options.cssModules) {
        attribs = attribs.replace(/"class":"([^"]*)"/, (_, $1) => {
            const classes = $1.split(/\s+/).map(className => {
                if (!className) {
                    return '';
                }
                const string = JSON.stringify(className);
                return `styles && styles[${string}] || ${string}`;
            });
            return `"class":[${classes.join(',')}].join(' ')`;
        });
    }

    let children = '[]';
    if (node.children) {
        children = '[' +
            node.children
                .map(childNode => assembleNode(context, options, childNode))
                .join(', ') +
        ']';
    }

    if (root) {
        return `h('${node.name}', Object.assign(${attribs}, rest), ${children})`;
    }

    return `h('${node.name}', ${attribs}, ${children})`
}

module.exports = function(source) {
    if (this.cacheable) this.cacheable();

    const options = getOptions(this);
    const handler = new htmlparser.DefaultHandler(function (error) {
        if (error) throw error;
    });
    const parser = new htmlparser.Parser(handler);
    parser.parseComplete(source);

    const svgNode = handler.dom.find(node => node.type === 'tag' && node.name === 'svg');

    if (!svgNode) {
        throw new Error('Could not find svg element');
    }

    const svg = assembleNode(this, options, svgNode, true);

    this.callback(null, `

import { h } from 'preact';

export default function (props) {
    var styles = props.styles;
    var rest = Object.assign({}, props);
    delete rest.styles;

    return ${svg};
};

    `);
};
