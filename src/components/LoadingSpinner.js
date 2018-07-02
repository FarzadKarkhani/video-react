import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { play } from '../actions/player';

const propTypes = {
  player: PropTypes.object,
  className: PropTypes.string,
};

export default function LoadingSpinner({ player, className }) {
  if (player.error) {
    return null;
  }
  return (
    <div
      className={classNames(
        'video-react-loading-spinner',
        className
      )}
    >
      <div className="spinner-main">
        <div className="spinner-big" />
        <div className="spinner-small" />
      </div>
    </div>
  );
}

LoadingSpinner.propTypes = propTypes;
LoadingSpinner.displayName = 'LoadingSpinner';
