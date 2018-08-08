import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

import ProgressControl from './ProgressControl';
import PlayToggle from './PlayToggle';
import AudioOnly from './AudioOnly';
import Live from './Live';
import QualityPicker from './QualityPicker';
import ForwardControl from './ForwardControl';
import ReplayControl from './ReplayControl';
import FullscreenToggle from './FullscreenToggle';
import RemainingTimeDisplay from '../time-controls/RemainingTimeDisplay';
import CurrentTimeDisplay from '../time-controls/CurrentTimeDisplay';
import DurationDisplay from '../time-controls/DurationDisplay';
import TimeDivider from '../time-controls/TimeDivider';
import VolumeMenuButton from './VolumeMenuButton';
import PlaybackRateMenuButton from './PlaybackRateMenuButton';
import { mergeAndSortChildren } from '../../utils';

const propTypes = {
  children: PropTypes.any,
  autoHide: PropTypes.bool,
  className: PropTypes.string,
};

const defaultProps = {
  autoHide: true,
};

export default class ControlBar extends Component {
  constructor(props) {
    super(props);
  }

  getChildren() {
    const children = React.Children.toArray(this.props.children);
    return mergeAndSortChildren([], children, this.props);
  }

  render() {
    const { autoHide, className, player: { isLive, tracks, activeTrack } } = this.props;
    const children = this.getChildren();

    return (
      <div
        className={classNames('video-react-control-bar', {
          'video-react-control-bar-auto-hide': autoHide
        }, className)}
      > 
        {!isLive &&
          <div className="video-react-control-bar-progress-bar">
            <ProgressControl
              {...this.props}
              key="progress-control"
              order={8}
            />
          </div>
        }
        <div className="video-react-control-bar-buttons">
          <div className="video-react-control-left">
            <PlayToggle
              {...this.props}
              key="play-toggle"
              order={1}
            />
            <VolumeMenuButton
              {...this.props}
              key="volume-menu-button"
              order={4}
            />
            {!isLive 
              ? <div className="video-react-control-time-display">
                  <CurrentTimeDisplay
                    {...this.props}
                    key="current-time-display"
                    order={5}
                  />
                  <TimeDivider
                    {...this.props}
                    key="time-divider"
                    order={6}
                  />
                  <DurationDisplay
                    {...this.props}
                    key="duration-display"
                    order={7}
                  />
                </div>
              : <Live 
                  {...this.props}
                  key="live-indicator"
                  order={8}
                />
            }
          </div>
          <div className="video-react-control-right">
            {children}
            {(tracks && tracks.length > 1) &&
              <QualityPicker
                {...this.props}
                activeTrack={activeTrack}
                tracks={tracks}
                order={11}
              />
            }
            <FullscreenToggle
              {...this.props}
              key="fullscreen-toggle"
              order={12}
            />
          </div>
        </div>
      </div>
    );
  }
}

ControlBar.propTypes = propTypes;
ControlBar.defaultProps = defaultProps;
ControlBar.displayName = 'ControlBar';
