import React, { Component } from 'react';

import ImageList from './components/ImageList';
import FileChooserButton from './components/FileChooserButton';

const defaultImages = [
    {
        id: 'one',
        url: '/assets/tmp/3004055302_fc648f2767_q.jpg',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
        id: 'two',
        url: '/assets/tmp/7421840342_bcabc0cfe9_q.jpg',
    },
    {
        id: 'three',
        url: '/assets/tmp/7666068344_3152e694eb_q.jpg',
        description: 'Regular fish',
    },
];

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            images: [].concat(defaultImages),
        };

        this._addImages = this._addImages.bind(this);
    }

    render() {
        return (
          <div className="App">
              <div><FileChooserButton onChoice={this._addImages}>{'Choose files'}</FileChooserButton></div>
              <ImageList images={this.state.images}/>
          </div>
        );
    }

    async _addImages(e) {
        const images = [];
        for (const file of Array.from(e.target.files)) {
            try {
                images.push(await readFile(file));
            } catch(e) {} //empty
        }

        const prefix = `image-${Date.now()}-`;
        this.setState({
            images: images.map((image, index) => ({
                id: prefix + index,
                url: image,
            })).concat(this.state.images),
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

export default App;
