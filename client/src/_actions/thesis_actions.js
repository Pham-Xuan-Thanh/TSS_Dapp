import axios from 'axios';
import {
    CREATE_THESIS,
    ERROR_THESIS,
    LIST_THESISES,
    UPDATE_THESIS,
    DELETE_THESIS,
    EXPORT_KEYWORDS,
    UPLOAD_CHAPTER,
    PUBLISH_CHAPTER,
    PUSH_CHAPTER
} from './types';
import { eciesDecrypt } from '../helper/ecies';
import { TransactionInput } from './transaction_actions';

export function createThesis(dataToSubmit) {
    console.log("CREATE THESIS", dataToSubmit)
    const request = axios.post("/api/thesis/create", dataToSubmit)
        .then(resp => resp.data)
    return {
        type: CREATE_THESIS,
        payload: request
    }

}
export async function searchList(query) {
    const request = await axios.get(`/api/thesis/chapter/search?query=${query}`)
        .then(resp => resp.data)

    return {
        type : LIST_THESISES, 
        payload : request
    }
}
export async function listThesises() {
    const request = await axios.get("/api/thesis/list")
        .then(resp => resp.data)

    return {
        type: LIST_THESISES,
        payload: request
    }
}

export function deleteThesis(dataToSubmit) {
    const request = axios.delete(`/api/thesis/delete/${dataToSubmit}`)
        .then(resp => resp.data)

    return {
        type: DELETE_THESIS,
        payload: request
    }
}

export function editThesis(dataToSubmit) {
    const request = axios.post(`/api/thesis/edit/${dataToSubmit._id}`, dataToSubmit)
        .then(resp => {console.log("edistor", resp); return resp.data})
    return {
        type: UPDATE_THESIS,
        payload: request
    }
}

export async function downloadThesis(thesisID, chapterID,dataToSubmit) {
    const res = await axios.post(`/api/thesis/${thesisID}/chapter/${chapterID}/download`,dataToSubmit , {responseType : "blob"})
                        
    return res
}

export function uploadChapter(dataToSubmit, config) {
    const request = axios.post(`/api/thesis/chapter/create`, dataToSubmit, config)
        .then(resp => resp.data)

    return {    
        type: UPLOAD_CHAPTER,
        payload: request
    }
}

export function publishChapter(thesisID, chapterID, dataToSubmit){
    const request = axios.post(`/api/thesis/${thesisID}/publishchapter/${chapterID}`, dataToSubmit)
    .then(resp => resp.data)

    return {
        type : PUBLISH_CHAPTER,
        payload : request
    }
}

export function pushChapter2IPFS(thesisID, chapterID,notStore = false){
    const request = axios.post(`/api/thesis/${thesisID}/pushchapter/${chapterID}`,{notStore})
    .then(resp => resp.data)
    
    return {
        type : UPDATE_THESIS,
        payload : request
    }
}

export function shareChapterByEmail(thesisID, chapterID, dataToSubmit) {
        const request = axios.get(`/api/thesis/${thesisID}/chapter/${chapterID}`)
                .then( resp => resp.data)
                .then( resp => {
                    if (resp.success) {
                        console.log("data trong share ne:" ,resp)

                         return eciesDecrypt(dataToSubmit.priv_key,resp.thesis.chapters[0].filehash_enc) 
                            .then( filehash => {
                                resp.thesis._id = null
                                resp.thesis.chapters[0].isPublish = false
                                resp.thesis.chapters[0].publishat = 0
                                resp.thesis.chapters[0].filehash = filehash
                                resp.thesis.chapters[0].filehash_enc = ""
                                resp.thesis.chapters[0].filepath = ""

                                const req = axios.post(`/api/thesis/setthesis`,{email : dataToSubmit.email, thesis : resp.thesis})
                                    .then(res => res.data)
                                return req
                            })
                    }else {
                        return new Promise((_,reject) => reject("Cant get Encrypted File hash!! Confirm you published Chapter :(") )
                    }
                })
        return  {
            type :"abc",
            payload :  request
        }
                
}


export function exportKeywords(dataToSubmit) {
    return {
        type: EXPORT_KEYWORDS,
        payload: dataToSubmit
    }
}



