import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Hls from 'hls.js/dist/hls.light.min.js';
// import '!script-loader!hls.js/dist/hls.light.min.js'; 

class HLSSource extends Component {
  constructor() {
    super(...arguments);

    this.hls = new Hls(this.props.hlsOptions);
    this.levelLabels = ['low', 'medium', 'high'];

    this.onMediaAttached = this.onMediaAttached.bind(this);
    this.onManifestParsed = this.onManifestParsed.bind(this);
    this.onHlsError = this.onHlsError.bind(this);
    this.onLevelLoaded = this.onLevelLoaded.bind(this);
    this.onLevelSwitched = this.onLevelSwitched.bind(this);
    this.onLevelSwitching = this.onLevelSwitching.bind(this);
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
      this.hls.on(Hls.Events.LEVEL_SWITCHED, this.onLevelSwitched);
      this.hls.on(Hls.Events.LEVEL_SWITCHING, this.onLevelSwitching);
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
        player: { currentTime, duration, hls }
      } = this.props;

    const isLive = data.details.live || false;
    let hasDVR = false;
    const mediaDuration = data.details.totalduration;

    if (isLive && mediaDuration > dvrThreshold) {
      hasDVR = true;
    }

    if (isLive && hls && hls.levels[hls.currentLevel]) {
      const targetDuration = hls.levels[hls.currentLevel].details.targetduration;
      const liveSync = hls.config.liveSyncDurationCount;
      const liveOffset = targetDuration * liveSync;
      const liveTime = duration - liveOffset;
      const latency = liveTime - currentTime;
      actions.handleMediaLatencyChange(liveTime, latency);
    }

    actions.handleMediaStateChange(hasDVR, isLive);
  }

  onLevelSwitched(e, data) {
    const { actions } = this.props;
    actions.handleRealTrackChange(data.level, false);
  }

  onLevelSwitching(e, data) {
    const { actions } = this.props;
    actions.handleRealTrackChange(data.level, true);
  }

  onHlsError(e, data) {
    const { onError } = this.props;
    let recoverDecodingErrorDate, recoverSwapAudioCodecDate;
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.MEDIA_ERROR:
          const now = new Date().getTime();
          if (!recoverDecodingErrorDate || (now - recoverDecodingErrorDate) > 3000) {
            recoverDecodingErrorDate = new Date().getTime();
            this.hls.recoverMediaError();
          } else if(!recoverSwapAudioCodecDate || (now - recoverSwapAudioCodecDate) > 3000) {
            recoverSwapAudioCodecDate = new Date().getTime();
            this.hls.swapAudioCodec();
            this.hls.recoverMediaError();
          }
          break;
        case Hls.ErrorTypes.NETWORK_ERROR:
          this.hls.startLoad();
          break;
        default:
          this.hls.destroy();
          break;
      }
    }
    onError(e, data);
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
  hlsOptions: { liveSyncDurationCount: 3, debug: false },
  type: 'application/x-mpegURL',
};

export default HLSSource;
