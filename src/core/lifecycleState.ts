import type { LifecycleState } from './types'

export class LifecycleStartedState implements LifecycleState {
  readonly name = 'started'
}

export class LifecycleStoppedState implements LifecycleState {
  readonly name = 'stopped'
}
