import * as React from 'react';

export class Stage extends React.Component<{}, {}> {
  public render() {
    return (
      <div>
        Stage
      </div>
    );
  }
}

export function rootComponent() {
  return <Stage />;
}
