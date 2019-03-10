import * as React from 'react';

import {styled} from './styling';

interface Props {
  className?: string;
}

export class Stage extends React.Component<Props, {}> {
  public render() {
    return (
      <div className={this.props.className}>
        Stage
      </div>
    );
  }
}

const StyledStage = styled(Stage)`
`;

export function rootComponent() {
  return <StyledStage />;
}
