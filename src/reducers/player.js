import {
  LOAD_START, CAN_PLAY,
  WAITING, CAN_PLAY_THROUGH, PLAYING,
  PLAY, PAUSE, END, SEEKING, SEEKED,
  SEEKING_TIME, END_SEEKING, DURATION_CHANGE,
  TIME_UPDATE, VOLUME_CHANGE, PROGRESS_CHANGE,
  RATE_CHANGE, SUSPEND, ABORT, EMPTIED,
  STALLED, LOADED_META_DATA, LOADED_DATA,
  RESIZE, ERROR, MEDIA_STATE_CHANGE, LOADED_LEVELS,
  TRACK_CHANGE, REAL_TRACK_CHANGE, MANIFEST_PARSED, MEDIA_LATENCY_CHANGE
} from '../actions/video';
import { FULLSCREEN_CHANGE, PLAYER_ACTIVATE, USER_ACTIVATE } from '../actions/player';

const initialState = {
  currentSrc: null,
  duration: 0,
  currentTime: 0,
  seekingTime: 0,
  buffered: null,
  waiting: false,
  seeking: false,
  paused: true,
  autoPaused: false,
  ended: false,
  playbackRate: 1,
  muted: false,
  volume: 1,
  isLive: false,
  hasDVR: false,
  liveTime: 0,
  latency: 0,
  activeTrack: -1,
  realActiveTrack: -1,
  switchingTrack: false,
  tracks: [],
  readyState: 0,
  networkState: 0,
  videoWidth: 0,
  videoHeight: 0,
  hasStarted: false,
  userActivity: true,
  isActive: false,
  isFullscreen: false,
  hls: null,
  secondsPlayed: 0,
  percentPlayed: 0,
  delayToStartPlaying: 0
};

export function player(state = initialState, action) {
  switch (action.type) {
    case USER_ACTIVATE:
      return {
        ...state,
        userActivity: action.activity
      };
    case PLAYER_ACTIVATE:
      return {
        ...state,
        isActive: action.activity
      };
    case FULLSCREEN_CHANGE:
      return {
        ...state,
        isFullscreen: !!action.isFullscreen,
      };
    case SEEKING_TIME:
      return {
        ...state,
        seekingTime: action.time
      };
    case END_SEEKING:
      return {
        ...state,
        seekingTime: 0,
      };
    case LOAD_START:
      return {
        ...state,
        ...action.videoProps,
        hasStarted: false,
        ended: false,
      };
    case CAN_PLAY_THROUGH:
    case CAN_PLAY:
      return {
        ...state,
        ...action.videoProps,
        waiting: false,
      };
    case WAITING:
      return {
        ...state,
        ...action.videoProps,
        waiting: true
      };
    case PLAYING:
      return {
        ...state,
        ...action.videoProps,
        waiting: false,
        delayToStartPlaying: action.delayToStartPlaying
      };
    case PLAY:
      return {
        ...state,
        ...action.videoProps,
        ended: false,
        paused: false,
        autoPaused: false,
        waiting: false,
        hasStarted: true,
      };
    case PAUSE:
      return {
        ...state,
        ...action.videoProps,
        paused: true
      };
    case END:
      return {
        ...state,
        ...action.videoProps,
        ended: true
      };
    case SEEKING:
      return {
        ...state,
        ...action.videoProps,
        seeking: true
      };
    case SEEKED:
      return {
        ...state,
        ...action.videoProps,
        seeking: false
      };
    case ERROR:
      return {
        ...state,
        ...action.videoProps,
        error: 'UNKNOWN ERROR',
        ended: true
      };
    case MEDIA_STATE_CHANGE:
      return {
        ...state,
        hasDVR: action.hasDVR,
        isLive: action.isLive,
      };
    case MEDIA_LATENCY_CHANGE:
      return {
        ...state,
        liveTime: action.liveTime,
        latency: action.latency,
      };
    case LOADED_LEVELS:
      return {
        ...state,
        tracks: action.tracks
      };
    case MANIFEST_PARSED:
      return {
        ...state,
        hls: action.hls
      };
    case TRACK_CHANGE:
      return {
        ...state,
        activeTrack: action.activeTrack
      };
    case REAL_TRACK_CHANGE:
      return {
        ...state,
        realActiveTrack: action.realActiveTrack,
        switchingTrack: action.switchingTrack
      };
    case TIME_UPDATE:
      return {
        ...state,
        ...action.videoProps,
        secondsPlayed: action.secondsPlayed,
        percentPlayed: action.percentPlayed
      };
    case DURATION_CHANGE:
    case VOLUME_CHANGE:
    case PROGRESS_CHANGE:
    case RATE_CHANGE:
    case SUSPEND:
    case ABORT:
    case EMPTIED:
    case STALLED:
    case LOADED_META_DATA:
    case LOADED_DATA:
    case RESIZE:
      const newState = {
        ...state,
        ...action.videoProps,
      };
      if (action.videoProps.paused === false) {
        newState.hasStarted = true;
        newState.waiting = false;
      }
      return newState;
    default:
      return state;
  }
}

export default player;
