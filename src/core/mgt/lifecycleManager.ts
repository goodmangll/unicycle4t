import LifecycleObject from "../lifecycleObject";
import type { ObjectId } from "../types";

export default interface LifecycleManager {

    /**
     * 创建一个生命周期对象
     * @returns 生命周期对象
     */
    createObject(): Promise<LifecycleObject>;

    /**
     * 启动一个生命周期对象
     * @param id 对象ID
     */
    startObject(id: ObjectId): Promise<void>;

    /**
     * 获取一个生命周期对象
     * @param id 对象ID
     * @returns 生命周期对象
     */
    getObject(id: ObjectId): Promise<LifecycleObject | null>;

    /**
     * 停止一个生命周期对象
     * @param id 对象ID
     */
    stopObject(id: ObjectId): Promise<void>;

    /**
     * 删除一个生命周期对象
     * @param id 对象ID
     */
    deleteObject(id: ObjectId): Promise<void>;

}