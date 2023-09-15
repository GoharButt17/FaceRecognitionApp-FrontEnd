import React,{Component} from 'react';
import ParticlesBg from 'particles-bg';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecogniton';
import Register from './components/Register/Register';
import SignIn from './components/SignIn/SignIn';
import './App.css';


const initialState = {
  
    input : '',
    ImageUrl : '',
    box : {} ,
    route : 'SignIn',
    isSignedIn : false,
    user : {
      id : '',
      name : '',
      email : '',
      entries : 0,
      joined : ''
    }
}
class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user : {
      id : data.id,
      name : data.name,
      email : data.email,
      entries : data.entries,
      joined : data.joined
    }});
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol : clarifaiFace.left_col * width,
      topRow : clarifaiFace.top_row * height,
      rightCol : width - (clarifaiFace.right_col * width),
      bottomRow : height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box : box});
  }

  onInputChange = (event) =>{
    this.setState({input : event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({ImageUrl : this.state.input});
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // In this section, we set the user authentication, user and app ID, model details, and the URL
    // of the image we want as an input. Change these strings to run your own example.
    //////////////////////////////////////////////////////////////////////////////////////////////////

    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const PAT = 'f1bff1ca6f1848069b2bb748ae7687fd';
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const USER_ID = '7anorsqev3vk';       
    const APP_ID = 'my-first-application-mw45kc';
    // Change these to whatever model and image URL you want to use
    const MODEL_ID = 'face-detection';
    const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';    
    const IMAGE_URL = this.state.input;

    ///////////////////////////////////////////////////////////////////////////////////
    // YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
    ///////////////////////////////////////////////////////////////////////////////////

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": IMAGE_URL
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id

    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
        .then(response => response.text())
        .then(result => {
          if (result) {
            fetch ('https://red-adventurous-chameleon.cyclic.app/image', {
              method : 'PUT',
              headers : {'content-type': 'application/json'},
              body : JSON.stringify({
                id : this.state.user.id
              })
            })
              .then (result => result.json())
              .then (count => {
                this.setState(Object.assign(this.state.user, {entries : count}));
              })
          }
          const jsonResponse = JSON.parse(result); // Parse the JSON response
          this.displayFaceBox(this.calculateFaceLocation(jsonResponse));
        })
        .catch(error => console.log('error', error));

  }

  onRouteChange = (route) =>{
    if (route === 'SignOut')
    {
      this.setState(initialState);
    }
    else if (route === 'home')
    {
      this.setState({isSignedIn: true});
    }
    this.setState({route : route});
  }
  render(){
    return (
      <div className="App">
        <ParticlesBg className="particles" color="#FFFFFF" num={130} type="cobweb" bg={true} />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        { this.state.route === 'home'
          ? <div>
              <Logo />
              <Rank name={this.state.user.name}/>
              <ImageLinkForm 
                onInputChange = {this.onInputChange} 
                onButtonSubmit = {this.onButtonSubmit}
              />
              <FaceRecognition box= {this.state.box} ImageUrl ={this.state.ImageUrl}/>
            </div>
          : (
              this.state.route === 'SignIn'
              ? <SignIn loadUser={this.loadUser} onRouteChange ={this.onRouteChange}/>
              : <Register loadUser={this.loadUser} onRouteChange ={this.onRouteChange}/>
            )
          }
      </div>
    );
  }
}

export default App;
