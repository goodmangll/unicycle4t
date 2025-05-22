export type ObjectId = string | number


/**
 * 生命周期状态接口
 * 所有具体的生命周期状态都应该实现这个接口
 */
export interface LifecycleState {
    /**
     * 状态名称
     */
    readonly name: string;

}
