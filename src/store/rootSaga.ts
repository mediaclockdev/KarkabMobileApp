import { all, fork } from 'redux-saga/effects'
import { SagaIterator } from 'redux-saga'

import authSaga from '../auth/redux/authSaga'

export default function* rootSaga(): SagaIterator {
  yield all([
    fork(authSaga),
    // fork(feedSaga),
  ])
}
