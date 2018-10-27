import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import ImagePreview from './ImagePreview';
import style from './ImageList.module.css';

export default class ImageList extends PureComponent {
    static propTypes = {
        images: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                url: PropTypes.string.isRequired,
                description: PropTypes.string,
            }).isRequired
        ),
    };

    render() {
        return (
            <div className={style.imageList}>
                <ul className={style.list}>
                    {this.props.images.map((image) => (
                        <li key={`image-${image.id}`} className={style.item}>
                            <ImagePreview {...image} />
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}

