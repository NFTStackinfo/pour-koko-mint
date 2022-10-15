// log
import store from "../store"

const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  }
}

const fetchDataSuccess = payload => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
  }
}

const fetchDataFailed = payload => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  }
}

export const fetchData = account => {
  return async dispatch => {
    console.group('fetchData')
    dispatch(fetchDataRequest())
    try {
      console.log('blockchain: ', store.getState().blockchain)
      let name = await store
        .getState()
        .blockchain.smartContract.methods.name()
        .call()

      dispatch(
        fetchDataSuccess({
          name,
        })
      )
    } catch (err) {
      console.log(err)
      dispatch(fetchDataFailed("Could not load data from contract."))
    }
    console.groupEnd()
  }
}
