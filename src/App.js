import MintButton from './Components/MintButton'
import { useState } from 'react'

const App = () => {
  const [isMinted, setIsMinted] = useState(false)
  const onMint = () => setIsMinted(true)

  return (
    <div className="App">
      <main>
        <div className="container">
          <div className="content">
            <img src="/assets/logo.svg" alt="Pour Koko" className="logo"/>

            <div className="mint-container">
              <div className="mint-content">
                <h2>{isMinted ? 'Minted!' : 'Mint now'}</h2>

                <MintButton onMint={onMint}/>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
