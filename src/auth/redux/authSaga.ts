import { put, select, takeLatest, call } from 'redux-saga/effects'
import { SagaIterator } from 'redux-saga'
import {
  
  loginSuccess,
  loginRequest,
} from './authSlice'
import type { RootState } from '../../app/store'
import authService, { AuthResponse } from '../../services/auth.service'

/* ---------------- RESTORE SESSION ---------------- */

function* handleRestoreSession(): SagaIterator {
  try {
    const accessToken: string | null = yield select(
      (state: RootState) => state.auth.accessToken
    )

    if (!accessToken) {
    //  yield put(logout())
    }
  } catch {
    //yield put(logout())
  } finally {
    //yield put(restoreSessionComplete())
  }
}

/* ---------------- LOGIN ---------------- */

function* handleLogin(
  action: any
): SagaIterator {
  try {
    const data: AuthResponse = yield call(
      authService.login,
      action.payload
    )

    yield put(
      loginSuccess({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
    )
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Something went wrong'

   // yield put(loginFailure(message))
  }
}

/* ---------------- ROOT SAGA ---------------- */

export default function* authSaga(): SagaIterator {
 // yield takeLatest(restoreSession.type, handleRestoreSession)
  yield takeLatest(loginRequest.type, handleLogin)
}
