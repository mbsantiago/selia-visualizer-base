import React from 'react';


class Toolbar extends React.Component {
  render() {
    const { moveButton, homeButton } = this.props;

    return (
      <div className="col p-2">
        {moveButton()}
        {homeButton()}
      </div>
    );
  }
}


export default Toolbar;
