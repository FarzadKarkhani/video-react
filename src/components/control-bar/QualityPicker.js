import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MenuButton from '../menu/MenuButton';

class QualityPicker extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleSelectItem = this.handleSelectItem.bind(this);
  }

  handleSelectItem(index) {
    const { tracks, actions } = this.props;
    if (index >= -1 && index < tracks.length) {
      actions.handleTrackChange(index - 1);
    }
  }

  render() {
    const { activeTrack, tracks } = this.props;
    const activeTrackLabel = tracks.filter(item => item.id === activeTrack)[0];
    const items = tracks.map((item, index) => (
      {
        label: item.label,
        value: index,
      }
    ));
    const selectedIndex = activeTrackLabel.id === -1 ? 0 : activeTrackLabel.id;

    return (
      <MenuButton
        items={items}
        selectedIndex={selectedIndex}
        onSelectItem={this.handleSelectItem}
        className='video-react-menu-quality'
      >
        <div className='video-react-active-track-label'>{activeTrackLabel.label}</div>
      </MenuButton>
    );
  }
}

QualityPicker.propTypes = {
  activeTrack: PropTypes.number,
  tracks: PropTypes.array,
  onSetTrack: PropTypes.func,
};

export default QualityPicker;
