import {v4 as uuidv4} from "uuid";

const baseLib = {
    genId() {
        return uuidv4();
    }
}
export default baseLib;