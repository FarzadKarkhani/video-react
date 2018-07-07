import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

const propTypes = {
  actions: PropTypes.object,
  player: PropTypes.object,
  audioUrl: PropTypes.string,
  videoUrl: PropTypes.string,
  className: PropTypes.string,
};

export default class AudioOnly extends Component {

  constructor(props, context) {
    super(props, context);
    this.handleClick = this.handleClick.bind(this);

  }

  handleClick() {
    const { video, src, audioUrl, videoUrl } = this.props;
    if (player.paused) {
      video.src = audioUrl;
    } else {
      video.src = videoUrl;
    }
    // console.log(this.props)
    video.load();
    video.play();
  }

  render() {
    const { player, className, audioUrl } = this.props;
    const controlText = player.paused ? 'Audio Only' : 'Video';

    if (audioUrl) {
      return (
          <button
          ref={
            (c) => {
              this.button = c;
            }
          }
          className={classNames(className, {
            'video-react-audio-only-control': true,
            'video-react-control': true,
            'video-react-button': true,
            'video-react-icon-video-has': !player.paused,
            'video-react-icon-video-no': player.paused,
          })}
          type="button"
          tabIndex="0"
          onClick={this.handleClick}
        >
          <span className="video-react-control-text">
            {controlText}
          </span>
        </button>
      );
    } else {
      return null
    }
  }
}

AudioOnly.propTypes = propTypes;
AudioOnly.displayName = 'AudioOnly';
