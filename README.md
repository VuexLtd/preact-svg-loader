# preact-svg-loader
Load svg files as preact components.

## Usage

Add the loader to your webpack config.
```js
rules: [
    {
        test: /\.svg$/,
        use: ['preact-svg-loader'],
    }
]
```

In your code, simply require the svg as if it were a component.
```jsx
import Logo from './logo.svg';

() => <Logo />
```