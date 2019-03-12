import * as styledComponents from 'styled-components';

const {
  default: styled,
  css,
  injectGlobal,
  keyframes,
  ThemeProvider
} = styledComponents as styledComponents.ThemedStyledComponentsModule<ThemeVariables>;

export interface ThemeVariables {
  colorRed: string;
}

export const defaultTheme: ThemeVariables = {
  colorRed: '#f76c6c',
};

// tslint:disable-next-line: no-unused-expression
injectGlobal`
* {
  box-sizing: border-box;
}

body {
  background: #111;
  margin: 0;
  padding: 20px;
  font-size: 14px;
  color: #ddd;
}

button {
  position: relative;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 200ms;
  padding: 6px 8px;
  border-radius: 3px;
  border: 1px solid #151516;
  overflow: hidden;
  color: #F3F3F5;
  background: linear-gradient(to bottom, #4f5053, #343436);
  text-shadow: 0 -1px rgba(0, 0, 0, 0.7);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 1px 0 0 rgba(0,0,0,0.25);

  &:hover {
    outline-color: rgba(243, 243, 245, 0.3);
    background: linear-gradient(to bottom, #5e6064, #393A3B);
    text-shadow: 0 -1px rgba(0, 0, 0, 0.7);
  }

  &:active {
    color: #ffffff;
    outline-color: rgba(255, 255, 255, 0.3);
    background: linear-gradient(to bottom, #242525, #37383A);
    text-shadow: 0 -1px rgba(0, 0, 0, 0.4);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 0 0 rgba(255,255,255,0.15);
    transition-duration: 50ms;
  }
}

`;

export { styled, css, injectGlobal, keyframes, ThemeProvider };
