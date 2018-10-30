import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import style from './Dialog.module.css';

export default class Dialog extends PureComponent {
    static propTypes = {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        children: PropTypes.node,
        onClose: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this._closeIfNecessary = this._closeIfNecessary.bind(this);
    }

    render() {
        return (
            <div className={style.dialog}>{this.props.children}</div>
        );
    }

    componentDidMount() {
        window.addEventListener('keydown', this._closeIfNecessary, false);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this._closeIfNecessary, false);
    }

    _closeIfNecessary(e) {
        if (e.key === 'Escape') {
            this.props.onClose();
        }
    }
}
