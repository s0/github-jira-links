import * as styledComponents from 'styled-components';

const {
  default: styled,
  css,
  injectGlobal,
  keyframes,
  ThemeProvider
} = styledComponents as styledComponents.ThemedStyledComponentsModule<ThemeVariables>;

export interface ThemeVariables {
}

export const defaultTheme: ThemeVariables = {
};

// tslint:disable-next-line: no-unused-expression
injectGlobal`
* {
  box-sizing: border-box;
}

body {
  background: #111;
  margin: 0;
  padding: 0;
  font-size: 14px;
  color: #ddd;
}
`;

export { styled, css, injectGlobal, keyframes, ThemeProvider };
