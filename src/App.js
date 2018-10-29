import React, { Component } from 'react';

import ImageList from './components/ImageList';
import FileChooserButton from './components/FileChooserButton';
import Loading from './components/Loading';

import style from './App.module.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            images: [],
            loading: false,
        };

        this._addImages = this._addImages.bind(this);
    }

    render() {
        return (
            <div>
                {this.state.loading && <div className={style.loading}><Loading /></div>}
                {!this.state.loading &&
                    <>
                        <div><FileChooserButton onChoice={this._addImages}>{'Choose files'}</FileChooserButton></div>
                        <ImageList images={this.state.images}/>
                    </>}
            </div>
        );
    }

    componentDidMount() {
        this.setState({loading: true}, async () => {
            const images = await retrieveImages();
            this.setState({
                images,
                loading: false
            });
        });
    }

    async _addImages(e) {
        const prefix = `image-${Date.now()}-`;
        const images = [];
        let index = 0;
        for (const file of Array.from(e.target.files)) {
            try {
                const id = prefix + index;
                images.push({
                    id,
                    url: await readFile(file),
                });
                uploadImage(id, file);
            } catch(e) {} //empty
            finally {
                index++;
            }
        }

        this.setState({
            images: images.concat(this.state.images),
        })
    }
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', function() {
            resolve(reader.result);
        });
        reader.addEventListener('error', function() {
            resolve(reader.error);
        });
        reader.readAsDataURL(file);
    });
}

function uploadImage(id, file) {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('image', file);

    return fetch('/api/images', {
        method: 'POST',
        body: formData,
    });
}

async function retrieveImages() {
    const response = await fetch('/api/images');
    if (!response.ok) {
        throw new Error('Could not retrieve images from the server');
    }
    return response.json();
}

export default App;
