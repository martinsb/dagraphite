import React, { Component, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';


import ImageList from './components/ImageList';
import FileChooserButton from './components/FileChooserButton';
import Loading from './components/Loading';
import Dialog from './components/Dialog';

import style from './App.module.css';

const ImageEditor = lazy(() => import('./components/ImageEditor'));

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            images: [],
            loading: false,
            currentId: undefined,
        };

        this._addImages = this._addImages.bind(this);
        this._openOrCloseImage = this._openOrCloseImage.bind(this);
        this._closeImage = this._closeImage.bind(this);
        this._updateDescription = this._updateDescription.bind(this);
    }

    render() {
        return (
            <div>
                {this.state.loading && <div className={style.loading}><Loading /></div>}
                {!this.state.loading &&
                    <>
                        <div><FileChooserButton onChoice={this._addImages}>{'Choose files'}</FileChooserButton></div>
                        {!!this.state.images.length && <ImageList images={this.state.images}/>}
                        {!this.state.images.length && <p>{'There are no images added'}</p>}
                    </>}
                {this.state.currentId &&
                    ReactDOM.createPortal(
                        <Dialog onClose={this._closeImage} width={300} height={400}>
                            <Suspense fallback={'Loading...'}>
                                <ImageEditor id={this.state.currentId} onSave={this._updateDescription}/>
                            </Suspense>
                        </Dialog>
                    , document.body)}
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

        //A little cheat just demonstration purposes.
        //We don't want to deal with single image loading upon application load,
        //thus just redirect the app to the "index" location
        if (window.location.hash) {
            window.location.href = '/';
        }

        window.addEventListener('hashchange', this._openOrCloseImage, false);
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this._openOrCloseImage, false);
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

    _openOrCloseImage() {
        let imageId = window.location.hash;
        if (imageId.startsWith('#')) {
            imageId = imageId.substring(1);
        }

        this.setState({
            currentId: imageId || undefined,
        });
    }

    _closeImage() {
        window.location.href = '#';
    }

    _updateDescription({description}) {
        const {images, currentId} = this.state;
        if (!currentId) {
            throw new Error('No image is currently being edited');
        }
        const index = images.findIndex(({id}) => id === currentId);
        if (index === -1) {
            throw new Error(`No image with such id was found: ${currentId}`);
        }

        const nextImages = [].concat(images);
        nextImages[index] = Object.assign({}, nextImages[index], {description});
        this.setState({
            images: nextImages,
        });

        //this will trigger `_openOrCloseImage` which will, well, close the dialog because
        //there will be actually no image id
        window.location.href = '#';
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
