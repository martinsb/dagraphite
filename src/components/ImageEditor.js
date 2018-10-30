import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import style from './ImageEditor.module.css';

import Loading from './Loading';

export default class ImageEditor extends PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired,
        onSave: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            url: undefined,
            description: undefined,
        };

        this._changeDescription = this._changeDescription.bind(this);

        this._apply = this._apply.bind(this);
    }

    render() {
        const {loading, url, description} = this.state;
        return (
            <div className={style.imageEditor}>
                <h1>{`Image ${this.props.id}`}</h1>
                {loading && <div className={style.loading}><Loading /></div>}
                {!loading && 
                    <>
                        <img src={url} alt=""/>
                        <textarea value={description} onChange={this._changeDescription} />
                        <div><button onClick={this._apply}>{'Save'}</button></div>
                    </>}
            </div>
        );
    }

    componentDidMount() {
        this.setState({
            loading: true,
        }, async () => {
            try {
                const {url, description} = await fetchImage(this.props.id);
                this.setState({
                    loading: false,
                    url,
                    description: description || '',
                });
            } catch (e) {}
        });
    }

    _changeDescription(e) {
        this.setState({
            description: e.target.value,
        });
    }

    _apply() {
        const {description} = this.state;
        saveDescription(this.props.id, description);
        this.props.onSave({description});
    }
}

async function fetchImage(id) {
    const response = await fetch(`/api/images/${id}`);
    if (!response.ok) {
        throw new Error('Could not fetch image from the server');
    }
    return response.json();
}

async function saveDescription(id, contents) {
    const response = await fetch(`/api/images/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            description: contents,
        }),
    });
    if (!response.ok) {
        throw new Error('Could not save image description');
    }
}
