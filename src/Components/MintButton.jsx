import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isAndroid, isIOS } from 'react-device-detect'
import { fetchData } from '../redux/data/dataActions'
import { connect } from '../redux/blockchain/blockchainActions'
import addressList from '../addressList'
import { fixImpreciseNumber, normalizeMinMax } from '../utils/math'
import AppCountdown from './AppCountdown'
import { truncate } from '../utils/text'
import Button from './Button'

const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const PUBLIC_SALE_START = 1665473295000

const MintButton = ({ onMint }) => {
  const [isMinted, setIsMinted] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [fallback, setFallback] = useState('')
  const [mintCount, setMintCount] = useState(1)
  const [connectingMobile, setConnectingMobile] = useState(false)
  const [disableMint, setDisableMint] = useState(false)
  const [mintPrice, setMintPrice] = useState(null)
  const [numberMintWallet, setNumberMintWallet] = useState(null)
  const [maxTotalSupply, setMaxTotalSupply] = useState(null)
  const [totalSupply, setTotalSupply] = useState(null)
  const [publicMintActive, setPublicMintActive] = useState(true)
  const [maxMintCount, setMaxMintCount] = useState(10)
  const [notSelected, setNotSelected] = useState(true)
  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch()
  const blockchain = useSelector((state) => state.blockchain)
  const minMintCount = 1
  const errorMessages = [
    'Change network to ETH.',
    'Something went wrong.'
  ]
  const metamaskError = 'Install Metamask.'

  // claim NFTs
  const claimNFTs = async (_amount) => {
    setLoading(true)
    let tree

    const createMerkleTree = () => {
      const leaves = addressList.map(v => keccak256(v))
      tree = new MerkleTree(leaves, keccak256, { sort: true })
    }

    const getProof = (address) => {
      const leaf = keccak256(address)
      return tree.getHexProof(leaf)
    }

    createMerkleTree()

    const isMintActive = await blockchain.smartContract.methods.isMintActive().call()
    const isPreSaleMintActive = await blockchain.smartContract.methods.isPreSaleMintActive().call()
    const mint = isMintActive
      ? await blockchain.smartContract.methods.mint(blockchain.account, _amount) :
      isPreSaleMintActive
        ? await blockchain.smartContract.methods.preSaleMint(_amount, getProof(blockchain.account))
        : null

    if (mint && !disableMint) {
      // const mintPrice = await blockchain.smartContract.methods?.mintPrice().call() / 10 ** 18

      const balance = await blockchain.web3.eth.getBalance(
        blockchain.account,
        async (err, result) => {
          return blockchain.web3.utils.fromWei(result, 'ether')
        }
      )
      const roundedBalance = balance / 10 ** 18
      if (roundedBalance < fixImpreciseNumber(_amount * mintPrice)) {
        setLoading(false)
        return setFallback(
          `You don’t have enough funds to mint! Please, make sure to have ${fixImpreciseNumber(
            _amount * mintPrice
          )} ETH + gas.`
        )
      }
      if (roundedBalance) setLoading(false)
      mint.send({
        from: blockchain.account,
        value: blockchain.web3.utils.toWei(
          fixImpreciseNumber(mintPrice * _amount).toString(),
          'ether'
        )
      }).once('error', err => {
        if (err.code === -32000 || err.code === '-32000') {
          setFallback(
            'Insufficient funds, please add funds to your wallet and try again'
          )
        } else {
          setFallback('Sorry, something went wrong please try again')
        }
      }).then(receipt => {
        setIsMinted(true)
      })
    } else {
      setLoading(false)
      setFallback('The mint is not open yet.')
    }
  }

  useEffect(async () => {
    if (blockchain.account !== '' && blockchain.smartContract !== null) {

      dispatch(fetchData(blockchain.account))
      if (blockchain.account) {
        setWalletConnected(true)
        const isMintActive = await blockchain.smartContract.methods.isMintActive().call()
        const isPreSaleMintActive = await blockchain.smartContract.methods.isPreSaleMintActive().call()

        const price = isMintActive
          ?
          await blockchain.smartContract.methods.mintPrice().call() / 10 ** 18
          :
          await blockchain.smartContract.methods.preSaleMintPrice().call() /
          10 ** 18
        setMintPrice(price)

        const maximumMintSupply = await blockchain?.smartContract?.methods.maximumMintSupply().call()
        setMaxTotalSupply(+maximumMintSupply)

        if (isMintActive) {
          setNotSelected(false)
          setPublicMintActive(true)
          const publicMintMaxMint = await blockchain.smartContract.methods.maximumAllowedTokensPerWallet().call()
          setMaxMintCount(+publicMintMaxMint)

          const publicMintedWallet = await blockchain?.smartContract?.methods.publicMintClaimed(
            blockchain.account).call()
          setNumberMintWallet(+publicMintedWallet)
        } else if (isPreSaleMintActive) {
          const preSaleMaxMint = await blockchain.smartContract.methods.allowListMaxMint().call()
          setMaxMintCount(+preSaleMaxMint)

          const preSaleMintedWallet = await blockchain?.smartContract?.methods.allowListClaimedBy(
            blockchain.account).call()
          setNumberMintWallet(+preSaleMintedWallet)
          if (preSaleMaxMint === preSaleMintedWallet) {
            setDisableMint(true)
          }

          const root = await blockchain?.smartContract?.methods.getRoot().call()
          let tree

          const createMerkleTree = () => {
            const leaves = addressList.map(v => keccak256(v))
            tree = new MerkleTree(leaves, keccak256, { sort: true })
          }

          const getRoot = () => {
            return tree.getHexRoot()
          }


          createMerkleTree()
          const localRoot = getRoot()

          const account = await blockchain.account

          //uncomment this for seeing root in console
          // console.log({root});
          // console.log({localRoot});

          if (root === localRoot && addressList.includes(account)) {
            return setNotSelected(false)
          } else {
            setNotSelected(true)
            setFallback('Unfortunately you have not been selected to mint.')
          }
        }


        if (!isMintActive && !isPreSaleMintActive) {
          return setFallback('The minting is closed')
        }
        if (totalSupply > maxTotalSupply) {
          return setFallback('No more NFTs are left to mint for this stage.')
        }

        const getTotalSupply = await blockchain?.smartContract?.methods.getTotalSupply().call()
        setTotalSupply(Number(getTotalSupply))

      }
    }
  }, [
    blockchain.smartContract,
    totalSupply,
    maxMintCount,
    blockchain.account,
    maxTotalSupply,
    dispatch,
    walletConnected,
    notSelected,
    publicMintActive
  ])

  // TODO: change dapp link
  // blockchain error handling
  useEffect(() => {
    setConnectingMobile(true)

    setFallback('')
    if (blockchain.errorMsg && errorMessages.includes(blockchain.errorMsg)) {
      setFallback(blockchain.errorMsg)
    }
    if (blockchain.errorMsg === metamaskError && !(isIOS || isAndroid)) {
      window.location.replace(
        'https://metamask.app.link/dapp/mellow-mooncake-43c228.netlify.app/')
    }
  }, [blockchain.errorMsg])

  // open mobile metamask
  const openMobileMetamask = () => {
    if (typeof window.ethereum === 'undefined') {
      if (connectingMobile && !walletConnected && (isIOS || isAndroid)
        || blockchain.errorMsg === metamaskError) {
        window.location.replace(
          'https://metamask.app.link/dapp/mellow-mooncake-43c228.netlify.app/')
      }
    }

  }

  const handleMint = (e) => {
    e.preventDefault()
    setFallback('')
    claimNFTs(mintCount)
  }

  useEffect(() => {
    if (isMinted) {
      onMint()
    }
  }, [isMinted])
  return (
    <div className="mint-button__container">
      {walletConnected ? (
        <>
          <div className="mint-button__mint">
            <div className="mint-button__mint__info">
              <h4>{
                isMinted
                  ? (<>
                    Your mint was successful! <br />
                    Welcome to the pour koko fam
                  </>)
                  : publicMintActive
                    ? (<>
                      Public sale is live!
                    </>)
                    : notSelected
                      ? (<>
                        Congratulations - WL found <br />
                        Presale ends <AppCountdown date={PUBLIC_SALE_START} />
                      </>)
                      // if selected
                      : (<>
                        No WL found - public sale starts <br />
                        <AppCountdown date={PUBLIC_SALE_START} />
                      </>)
              }</h4>
            </div>

            <div className="mint-button__mint__wallet-address">
              <h5>Wallet Address - {truncate(
                blockchain.account,
                0, 6,
                blockchain.account?.length - 5, blockchain.account?.length - 1,
                '....'
              )}
              </h5>
            </div>

            <div className="mint-button__mint__btn">
              {((!publicMintActive && !notSelected) || publicMintActive) && !isMinted &&
                (<>
                  <div className="mint-input">
                    <button
                      onClick={() => setMintCount(normalizeMinMax(mintCount - 1, minMintCount, maxMintCount))}
                      disabled={mintCount === minMintCount}
                      className="btn-minus"
                    >
                      -
                    </button>

                    <span
                      className="mint-input__count"
                    >{mintCount}</span>

                    <button
                      onClick={() => setMintCount(normalizeMinMax(mintCount + 1), minMintCount, maxMintCount)}
                      disabled={mintCount + numberMintWallet >= maxMintCount ||
                        mintCount + totalSupply >= maxTotalSupply}
                      className="btn-plus"
                    >
                      +
                    </button>
                  </div>

                  <Button
                    onClick={(handleMint)}
                  >Mint now
                  </Button>
                </>)
              }
              {isMinted &&
                <a className="btn" href="https://pourkoko.com/">
                  <span>Back to website</span>
                </a>
              }
            </div>
          </div>
          {fallback && <p className="warn-text">{fallback}</p>}
        </>

      ) : (
        <div className="mint-button__connect-wallet">
          <h4>{!publicMintActive
            ? 'Connect wallet to mint'
            : <>
              Public sale is live!
              <br />
              Connect wallet to mint
            </>}
          </h4>

          <Button
            id="connectBtn"
            onClick={e => {
              e.preventDefault()
              dispatch(connect())
              openMobileMetamask()
            }}
          >
            Connect wallet
          </Button>
          {fallback && <p className="warn-text">{fallback}</p>}
        </div>
      )}
    </div>
  )
}

export default MintButton
