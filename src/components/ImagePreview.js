import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import style from './ImagePreview.module.css';

export default class ImagePreview extends PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        description: PropTypes.string,
    };
    render() {
        return (
            <div className={style.imagePreview}>
                <div className={style.image} style={{backgroundImage: `url('${this.props.url}')`}}></div>
                {this.props.description &&
                    <p className={style.description} title={this.props.description}>{this.props.description}</p>}
            </div>
        );
    }
}
