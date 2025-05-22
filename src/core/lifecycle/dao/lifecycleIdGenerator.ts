import LifecycleObject from "../lifecycleObject";

export default interface LifecycleIdGenerator {

    /**
     * 生成新的ID
     * @param lifecycleObject 生命周期对象
     * @returns 新的ID
     */
    generate(lifecycleObject: LifecycleObject): string;
}
