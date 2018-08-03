import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '!script-loader!hls.js/dist/hls.light.min.js'; // eslint-disable-line import/no-webpack-loader-syntax

class HLSSource extends Component {
  constructor() {
    super(...arguments);

    this.hls = new Hls(this.props.hlsOptions);
    this.levelLabels = ['low', 'medium', 'high'];
    this.dvrThreshold = this.props.dvrThreshold || 300;

    this.onMediaAttached = this.onMediaAttached.bind(this);
    this.onManifestParsed = this.onManifestParsed.bind(this);
    this.onHlsError = this.onHlsError.bind(this);
    this.onFragParsingMetadata = this.onFragParsingMetadata.bind(this);
    this.onFragChanged = this.onFragChanged.bind(this);
    this.onLevelLoaded = this.onLevelLoaded.bind(this);
  }

  componentDidMount() {
    const { video } = this.props;

    if (Hls.isSupported()) {
      this.hls.attachMedia(video);
      // hls events
      this.hls.on(Hls.Events.MEDIA_ATTACHED, this.onMediaAttached);
      // this.hls.on(Hls.Events.MANIFEST_PARSED, this.onManifestParsed);
      // this.hls.on(Hls.Events.ERROR, this.onHlsError);
      // this.hls.on(Hls.Events.FRAG_PARSING_METADATA, this.onFragParsingMetadata);
      // this.hls.on(Hls.Events.FRAG_CHANGED, this.onFragChanged);
      // this.hls.on(Hls.Events.LEVEL_LOADED, this.onLevelLoaded);
    }
  }

  componentWillUnmount() {
    this.hls.destroy();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.activeLevel !== nextProps.activeLevel) {
      this.hls.nextLevel = nextProps.activeLevel;
    }
  }

  onMediaAttached() {
    const { src } = this.props;
    this.hls.loadSource(src);
  }

  onManifestParsed(e, data) {
    const {
      video,
      hlsEvents: { onManifestParsed },
      autoPlay,
    } = this.props;

    this.hls.startLoad();
    if (autoPlay) video.play();
    onManifestParsed();
    this.buildTrackList(data.levels);
  }

  onRequestGoLive() {
    const duration = this.player.duration;
    const targetDuration = this.hls.levels[this.hls.currentLevel].details.targetduration;
    const liveSync = this.hls.config.liveSyncDurationCount;
    const liveOffset = targetDuration * liveSync;

    const liveTime = duration - liveOffset;

    this.player.currentTime = liveTime;
  }

  onLevelLoaded(e, data) {
    const { onMediaStatus } = this.props;
    const live = data.details.live;
    let hasDVR = false;
    const mediaDuration = data.details.totalduration;

    if (live && mediaDuration > this.dvrThreshold) {
      hasDVR = true;
    }
    onMediaStatus(
      hasDVR,
      live,
    );
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

  onFragParsingMetadata(e, data) {
    const { hlsEvents: { onFragParsingMetadata } } = this.props;

    onFragParsingMetadata(e, data);
  }

  onFragChanged(e, data) {
    const { hlsEvents: { onFragChanged } } = this.props;

    onFragChanged(e, data);
  }

  buildTrackList(levels) {
    const trackList = [];
    let activeLevel = this.props.activeLevel;

    if (levels.length > 1) {
      const autoLevel = {
        id: -1,
        label: 'اتوماتیک',
      };
      if (this.hls.manualLevel === -1) activeLevel = -1;
      trackList.push(autoLevel);
    }

    levels.forEach((level, index) => {
      const quality = {};

      quality.id = index;
      quality.label = this._levelLabel(level, index);
      trackList.push(quality);
      if (index === this.hls.manualLevel) activeLevel = index;
    });
    this.props.onLoadLevels(activeLevel, trackList);
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
  hlsEvents: PropTypes.object,
  onLoadLevels: PropTypes.func,
  onMediaStatus: PropTypes.func,
  onError: PropTypes.func,
  activeLevel: PropTypes.number,
};
HLSSource.defaultProps = {
  activeLevel: -1,
  hlsOptions: {},
  type: 'application/x-mpegURL',
  hlsEvents: {
    onMediaAttached: () => {},
    onManifestParsed: () => {},
    onFragChanged: () => {},
    onFragParsingMetadata: () => {},
  },
};

export default HLSSource;
