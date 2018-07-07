import React from 'react';
import { Player } from 'video-react';
import HLSSource from './HLSSource';

export default (props) => {
  // Add customized HLSSource component into video-react Player
  // The Component with `isVideoChild` attribute will be added into `Video` component
  // Please use this url if you test it from local:
  // http://www.streambox.fr/playlists/x36xhzz/x36xhzz.m3u8
  return (
    <Player>
      <HLSSource
        isVideoChild
        src="https://vod0.lahzecdn.com/hls/1530950233hQmFn3ef84ce82cb1d4bc7e32bb19a0e86176/master.m3u8"
      />
    </Player>
  );
};
