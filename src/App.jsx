import {Canvas,useFrame} from '@react-three/fiber'
import {Center, ContactShadows,Environment,OrbitControls} from '@react-three/drei'
import ModelLoader from './ModelLoader'; // Adjust the import path as necessary

export default function App(){


  return (

    <div className="app-container">


      
      <ModelLoader />
    </div>



  )


  
}