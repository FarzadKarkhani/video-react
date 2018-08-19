import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

const propTypes = {
  actions: PropTypes.object,
  className: PropTypes.string,
};

export default class Live extends Component {

  constructor(props, context) {
    super(props, context);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { actions, player: { latency, liveTime } } = this.props;

    if (liveTime && ( latency >= 20 )) {
      actions.seek(liveTime);
      actions.handleEndSeeking(liveTime);
      actions.play();
    }
  }

  render() {
    const { className, player: { latency } } = this.props;
    const controlText = 'Live';
    const labelText = 'زنده';

    return (
        <button
          ref={
            (c) => {
              this.button = c;
            }
          }
          className={classNames(className, {
            'video-react-live-control': true,
            'video-react-control': true,
            'video-react-button': true,
          })}
          type="button"
          tabIndex="0"
          onClick={this.handleClick}
        >
        <div className={classNames(className, {
            'video-react-live-label': true,
            'video-react-onair-label': (latency <= 20),
          })}>{labelText}</div>
        <span className="video-react-control-text">
          {controlText}
        </span>
      </button>
    );
  }
}

Live.propTypes = propTypes;
Live.displayName = 'Live';
