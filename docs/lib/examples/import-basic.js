import React from 'react';
import { Player } from 'video-react';

export default (props) => {
  return (
    <Player
      playsInline
      poster="/assets/poster.png"
      src="https://vod0.lahzecdn.com/hls/1530950233hQmFn3ef84ce82cb1d4bc7e32bb19a0e86176/master.m3u8"
    />
  );
};
