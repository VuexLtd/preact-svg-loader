const htmlparser = require("htmlparser");

function assembleNode(node) {
    if (node.type === 'text') {
        return `'${node.data.replace(/\n/g, '\\n')}'`;
    }

    const attribs = JSON.stringify(node.attribs || {});

    let children = '[]';
    if (node.children) {
        children = '[' +
            node.children
                .map(childNode => assembleNode(childNode))
                .join(', ') +
        ']';
    }

    return `h('${node.name}', ${attribs}, ${children})`
}

module.exports = function(source) {
    const handler = new htmlparser.DefaultHandler(function (error, dom) {});
    const parser = new htmlparser.Parser(handler);
    parser.parseComplete(source);

    const svgNode = handler.dom.find(node => node.type === 'tag' && node.name === 'svg');

    if (!svgNode) {
        throw new Error('Could not find svg element');
    }

    const svg = assembleNode(svgNode);

    this.callback(null, `

import { h } from 'preact';

export default function () {
    return ${svg};
};

    `);
};
