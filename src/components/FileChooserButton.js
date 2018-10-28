import React from 'react';
import PropTypes from 'prop-types';

import style from './FileChooserButton.module.css';

const FileChooserButton = (props) => (
    <div className={style.fileChooserButton}>
        <button>{props.children}</button>
        <input type="file" multiple onChange={props.onChoice}/>
    </div>
);


FileChooserButton.propTypes = {
    children: PropTypes.node,
    onChoice: PropTypes.func.isRequired,
};

export default React.memo(FileChooserButton);
