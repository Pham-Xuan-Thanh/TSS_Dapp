import axios from "axios";
import { SERVER_API } from "../components/Config";
export default axios.create({
    baseURL: `${SERVER_API}`,
    headers : {
        "Content-Type" : "application/json"
    }
})