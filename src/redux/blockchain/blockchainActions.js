// constants
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import SmartContract from '../../contracts/PourKokoNFT.json'
// log
import { fetchData } from '../data/dataActions'
import providerOptions from './providerOptions'

const connectRequest = () => {
  return {
    type: 'CONNECTION_REQUEST'
  }
}

const connectSuccess = payload => {
  return {
    type: 'CONNECTION_SUCCESS',
    payload: payload
  }
}

const connectFailed = payload => {
  return {
    type: 'CONNECTION_FAILED',
    payload: payload
  }
}

const updateAccountRequest = payload => {
  return {
    type: 'UPDATE_ACCOUNT',
    payload: payload
  }
}

export const connect = () => {
  return async dispatch => {
    // console.group('Connect')
    dispatch(connectRequest())
    // console.log('providerOptions', providerOptions)
    const web3Modal = new Web3Modal({
      network: 'mainnet', // optional
      cacheProvider: false, // optional
      providerOptions// required,
    })
    const provider = await web3Modal.connect()
    await provider.enable()
    const web3 = new Web3(provider)

    try {
      await provider.enable()
      // console.log('provider : ', provider)
      // console.log('web3 : ', web3)

      const accounts = await web3.eth.getAccounts((error, accounts) => {
        if (error) throw error
        return accounts
      })
      const account = accounts[0]
      // console.log('account : ', account)
      const networkId = await web3.eth.net.getId()
      // console.log('networkId : ', networkId)

      if (networkId === '1' || networkId === 1) {
        const SmartContractObj = new web3.eth.Contract(
          SmartContract.abi,
          '0xA61F84AcF07dd2732c06324E865292BDd6615Bc9'
        )
        // console.log('after SmartContractObj')
        // console.log('SmartContractObj : ', SmartContractObj)

        dispatch(
          connectSuccess({
            account,
            smartContract: SmartContractObj,
            web3: web3
          })
        )
        // Add listeners start
        provider.on('accountsChanged', (accounts) => {
          // console.group('accountsChanged')
          // console.log(accounts)
          dispatch(updateAccount(accounts[0]))
          // console.groupEnd()
        })

        // Subscribe to chainId change
        provider.on('chainChanged', (chainId) => {
          // console.group('chainChanged')
          window.location.reload()
          // console.log(chainId)
          // console.groupEnd()
        })
        // Add listeners end
      } else {
        dispatch(connectFailed('Change network to ETH.'))
      }
    } catch (err) {
      dispatch(connectFailed('Something went wrong.'))
    }
  }
}

export const updateAccount = account => {
  return async dispatch => {
    dispatch(updateAccountRequest({ account: account }))
    dispatch(fetchData(account))
  }
}
