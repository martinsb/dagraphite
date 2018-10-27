import React, { Component } from 'react';

import ImagePreview from './components/ImagePreview';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div><ImagePreview
                 id="one"
                 url="/assets/tmp/3004055302_fc648f2767_q.jpg"
                 description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
             />
        </div>
        <div><ImagePreview id="two" url="/assets/tmp/7421840342_bcabc0cfe9_q.jpg" /></div>
        <div><ImagePreview id="three" url="/assets/tmp/7666068344_3152e694eb_q.jpg" description="Regular fish" /></div>
      </div>
    );
  }
}

export default App;
