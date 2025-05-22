import LifecycleIdGenerator from "./lifecycleIdGenerator";
import LifecycleObject from "../lifecycleObject";
import { v4 as uuidv4 } from 'uuid';

/**
 * UUID 生命周期 ID 生成器
 * 
 * @author linden
 */
export default class UuidLifecycleIdGenerator implements LifecycleIdGenerator {
    
    generate(lifecycleObject: LifecycleObject): string {
        return uuidv4();
    }
}