import React from 'react';

export default class ZoomControls extends React.Component {
    constructor(props) {
        super(props);

        this.squaredChanged = this.squaredChanged.bind(this);
    }
    squaredChanged(ev) {
        this.props.squaredChanged(ev.target.checked);
    }
    render() {
        const {
            zoomInfo,
            label,
            showMultiplier = true,
            showSquared = true
        } = this.props;

        const {
            value,
            squared
        } = zoomInfo;

        const valueDisplay = `${value}${showMultiplier ? 'x' : ''}`;

        return (
            <div className={'zoom-controls'}>
                <span>
                    <button onClick={this.props.zoomOut}>-</button>
                    <span className='current-value' title={label}>
                        {valueDisplay}
                    </span>
                    <button onClick={this.props.zoomIn}>+</button>
                </span>
                {showSquared &&
                    <label>
                        <input
                            type='checkbox'
                            name='squared'
                            checked={!!squared}
                            onChange={this.squaredChanged}
                        />
                        2&#x207F;
                </label>
                }
            </div>
        );
    }
}
