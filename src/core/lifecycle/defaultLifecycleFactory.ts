import LifecycleFactory from "./lifecycleFactory";
import LifecycleObject from "./lifecycleObject";

export default class DefaultLifecycleFactory implements LifecycleFactory {

    
    async create(): Promise<LifecycleObject> {
        return new LifecycleObject();
    }

    
}