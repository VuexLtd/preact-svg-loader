const expect = require('chai').expect;

const {test, testVNodes} = require('./helpers');
const path = require('path');
const fs = require('fs');

describe('silly.svg', () => {

  const data = fs.readFileSync(path.join(__dirname, 'silly.svg'))

  test('should be silly', './silly.svg', data, {}, (parsed) => {
    expect(parsed).to.match(/"id":\s*\"svg-silly-[a-zA-z0-9]{7}\"/);
  });

  test('the color should be untouched', './silly.svg', data, {}, (parsed) => {
    const parts = parsed.split("#abcdef");
    // we use abcdef once as a color and a bunch as an id, make sure the color stayed
    expect(parts).to.have.length(2);
  });

  testVNodes('vnodes have right content', './silly.svg', data, {}, vnodes => {
    expect(vnodes.filter(({nodeName}) => nodeName === 'text')).to.deep.equal([
      {
        nodeName: "text",
        attributes: {class: 'notfill'},
        children: ["We need's to make sure \\ that all sorts of funky § gets through? &quot;"],
      }
    ]);
  })

  testVNodes('passes width/height/class/etc to root vnode', './silly.svg', data, {
    props: {
      width: 120,
      class: 'foo',
      id: 'foo2',
    }
  }, vnodes => {
    const svg = vnodes.filter(({ nodeName }) => nodeName === 'svg')[0];
    expect(svg.attributes).to.deep.equal({
      width: 120,
      height: '100',
      class: 'foo',
      id: 'foo2',
    });
  });


  testVNodes('does class replacement with a "styles" prop', './silly.svg', data, {
    props: {
      styles: {
        fill: 'replace-fill',
      },
    },
  }, vnodes => {
    const classes = vnodes.map(({ attributes: { class: className } }) => className)
      .filter(Boolean);
    expect(classes).to.deep.equal([
      'def', 'href', 'replace-fill', 'color replace-fill', 'notfill'
    ]);

  });


});
