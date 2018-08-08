import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import Hls from 'hls.js';
import '!script-loader!hls.js/dist/hls.light.min.js'; // eslint-disable-line import/no-webpack-loader-syntax

class HLSSource extends Component {
  constructor() {
    super(...arguments);

    this.hls = new Hls(this.props.hlsOptions);
    this.levelLabels = ['low', 'medium', 'high'];

    this.onMediaAttached = this.onMediaAttached.bind(this);
    this.onManifestParsed = this.onManifestParsed.bind(this);
    this.onHlsError = this.onHlsError.bind(this);
    this.onLevelLoaded = this.onLevelLoaded.bind(this);
  }

  componentDidMount() {
    const { video } = this.props;

    if (Hls.isSupported()) {
      this.hls.attachMedia(video);
      // hls events
      this.hls.on(Hls.Events.MEDIA_ATTACHED, this.onMediaAttached);
      this.hls.on(Hls.Events.MANIFEST_PARSED, this.onManifestParsed);
      this.hls.on(Hls.Events.ERROR, this.onHlsError);
      this.hls.on(Hls.Events.LEVEL_LOADED, this.onLevelLoaded);
    }
  }

  componentWillUnmount() {
    this.hls.destroy();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.player.activeTrack !== nextProps.player.activeTrack) {
      this.hls.nextLevel = nextProps.player.activeTrack;
    }
  }

  onMediaAttached() {
    const { src } = this.props;
    this.hls.loadSource(src);
  }

  onManifestParsed(e, data) {
    const {
      video,
      autoPlay,
      actions
    } = this.props;
    
    this.hls.startLoad();
    if (autoPlay) video.play();
    actions.handleManifestParsed(this.hls);
    this.buildTrackList(data.levels);
  }

  onLevelLoaded(e, data) {
    const { actions,
        dvrThreshold,
        player: { duration, currentTime, hls } 
      } = this.props;

    const isLive = data.details.live || false;
    let hasDVR = false;
    let latency = 0;
    const mediaDuration = data.details.totalduration;

    if (isLive && mediaDuration > dvrThreshold) {
      hasDVR = true;
    }

    if(isLive && hls.levels[hls.currentLevel]) {
      const targetDuration = hls.levels[hls.currentLevel].details.targetduration;
      const liveSync = hls.config.liveSyncDurationCount;
      const liveOffset = targetDuration * liveSync;
      const liveTime = duration - liveOffset;
      latency = liveTime - currentTime;
    }

    actions.handleMediaStateChange(hasDVR, isLive, latency);
  }

  onHlsError(e, data) {
    const { onError } = this.props;
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
        // try to recover network error
          this.hls.startLoad();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          this.hls.recoverMediaError();
          break;
        default:
        // cannot recover
          this.hls.destroy();
          break;
      }
      onError(e, data);
    }
  }

  buildTrackList(levels) {
    const trackList = [];
    let { player: activeTrack, actions } = this.props;

    if (levels.length > 1) {
      const autoLevel = {
        id: -1,
        label: 'اتوماتیک',
      };
      if (this.hls.manualLevel === -1) activeTrack = -1;
      trackList.push(autoLevel);
    }

    levels.forEach((level, index) => {
      const quality = {};

      quality.id = index;
      quality.label = this._levelLabel(level, index);
      trackList.push(quality);
      if (index === this.hls.manualLevel) activeTrack = index;
    });

    actions.handleLoadLevels(trackList);
  }

  _levelLabel(level, index) {
    if (level.height) return `${level.height}p`;
    else if (level.width) return `${Math.round(level.width * 9 / 16)}p`;
    else if (level.bitrate) return this.levelLabels[index] || `${parseInt((level.bitrate / 1000))}kbps`;
    return 0;
  }

  render() {
    const { src, type } = this.props;

    return (
      <source
        src={src}
        type={type}
      />
    );
  }
}

HLSSource.propTypes = {
  src: PropTypes.string,
  type: PropTypes.string,
  video: PropTypes.object,
  autoPlay: PropTypes.bool,
  hlsOptions: PropTypes.object,
  onError: PropTypes.func,
};
HLSSource.defaultProps = {
  hlsOptions: { liveSyncDurationCount: 0, debug: false },
  type: 'application/x-mpegURL',
};

export default HLSSource;
