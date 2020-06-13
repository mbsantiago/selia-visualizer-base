import React from 'react';


const styles = {
  button: {
    default: 'btn btn-light m-1',
    active: 'btn btn-primary m-1',
  }
}


class ToolbarContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: props.active,
      activator: props.activator,
      state: props.state,
    };

    this.states = props.states;
    this.styles = props.styles || styles;
  }

  handleMove() {
    this.state.activator();
    this.props.setState(this.states.MOVING);
    this.setState({ active: true, state: this.states.MOVING });
  }

  renderMoveButton() {
    const { active, state } = this.state;
    const className = active && state === this.states.MOVING
      ? styles.button.active
      : styles.button.default;

    return (
      <button
        type="button"
        className={className}
        onClick={() => this.handleMove()}
      >
        <i className="fas fa-arrows-alt" />
      </button>
    );
  }

  renderHomeButton() {
    const { resetConfig } = this.props;

    return (
      <button
        type="button"
        className={styles.button.default}
        onClick={resetConfig}
      >
        <i className="fas fa-home" />
      </button>
    );
  }

  renderRestoreConfig() {
    const { restoreConfig } = this.props;

    return (
      <button
        type="button"
        className={styles.button.default}
        onClick={restoreConfig}
      >
        <i className="fas fa-undo" />
      </button>
    );
  }

  handleStateChange(state) {
    this.props.setState(state);
    this.setState({ state });
  }

  render() {
    const Component = this.props.component;
    return (
      <Component
        active={this.state.active}
        activator={this.state.activator}
        state={this.state.state}
        states={this.props.states}
        styles={this.styles}
        setState={(state) => this.handleStateChange(state)}
        moveButton={() => this.renderMoveButton()}
        homeButton={() => this.renderHomeButton()}
        restoreButton={() => this.renderRestoreConfig()}
      />
    );
  }
}


export default ToolbarContainer;
