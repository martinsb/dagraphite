import React, { Component } from 'react';

import ImageList from './components/ImageList';

const images = [
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
  render() {
    return (
      <div className="App">
        <ImageList images={images}/>
      </div>
    );
  }
}

export default App;
