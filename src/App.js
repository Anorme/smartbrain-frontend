import React, {Component} from 'react';
import Navigation from './Components/Navigation/Navigation.js';
import Logo from './Components/Logo/Logo.js';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm.js';
import Rank from './Components/Rank/Rank.js';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition.js';
import SignIn from './Components/SignIn/SignIn.js';
import Register from './Components/Register/Register.js';
import ParticlesBg from 'particles-bg'; 
import 'tachyons';
import './App.css';

const initialState = {
  input: '',
  imageUrl:'',
  boxes: [],
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    email: '',
    name: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor () {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user:{
        id: data.id,
        email: data.email,
        name: data.name,
        entries: data.entries,
        joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);

    const dataArray = data.outputs[0].data.regions;
    const clarifaiFaces = dataArray.map((face) => {
      const clarifaiFace = face.region_info.bounding_box;
      // Accessing and rounding the bounding box values
      const topRow = clarifaiFace.top_row.toFixed(3);
      const leftCol = clarifaiFace.left_col.toFixed(3);
      const bottomRow = clarifaiFace.bottom_row.toFixed(3);
      const rightCol = clarifaiFace.right_col.toFixed(3);

      //Calculating the face box position 
      return {
        leftCol: leftCol * width,
        topRow: topRow * height,
        rightCol: width - (rightCol * width),
        bottomRow: height - (bottomRow * height)
      }
    });

    return clarifaiFaces;    
  }

  displayFaceBox = (boxes) => {
    console.log(boxes);
    this.setState({boxes: boxes});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value}); 
  }

  onPictureSubmit = () => {
  this.setState({imageUrl: this.state.input});
    fetch('https://smartbrain-server-psi.vercel.app/imageurl', {
      method: 'post',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })  
    .then(response => response.json())
    .then(response => {
      if (response) {
        fetch('https://smartbrain-server-psi.vercel.app/image', {
          method: 'put',
          headers: {'Content-Type' : 'application/json'},
          body: JSON.stringify({
          id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
        .catch(console.log)

      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(error => console.log('error', error));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({initialState})
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }
  
  render() {
    return (
      <div className="App">
        <>
          <ParticlesBg className="particles" color="#ffffff" type="cobweb" bg={true} num={100} />
        </>
      <Navigation isSignedIn ={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
      {this.state.route === 'home'
        ? <div>
          <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onButtonSubmit={this.onPictureSubmit}
            />
            <FaceRecognition boxes={this.state.boxes} imageUrl={this.state.imageUrl}/>
          </div>
        : (
            this.state.route === 'signin'
            ?<SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
      }
      </div>
    );
  }
}
 
export default App;
