import  axiosProxy from './axiosProxy';
import CommonController from "../utils/common/common";
const { axiosInstance } = axiosProxy;
const submitBasicConfig = async function (data : { name : string, description ?: string, tips? : string}){
    // try {
        let res = await axiosInstance({
            url : `/api/v1/tasks`,
            method : 'POST',
            data
        });
        return res.data.data;
    // }catch (e) {
    //     CommonController.notificationErrorMessage(e, 5);
    // }
}

const uploadFile = async function (taskId : number, params : any ){
    try {
        let data = new FormData();
        data.append('file', params.file);
        data.append('path', './')
        let res = await axiosInstance({
            url : `/api/v1/tasks/${taskId}/upload`,
            headers : {
              "Content-Type" : 'application/x-www-form-urlencoded',
            },
            method : 'POST',
            data
        });
        return res;
    }catch (e) {
        CommonController.notificationErrorMessage(e, 5);
    }
}

const updateTaskConfig = async function (taskId : number, taskConfig : any) {
    try {

        let res = await axiosInstance({
            url : `/api/v1/tasks/${taskId}`,
            method : 'PUT',
            data : taskConfig
        });
        return res;
    }catch (e) {
        CommonController.notificationErrorMessage(e, 5);
    }
}

const getTaskList =async function (){
    try {

        let res = await axiosInstance({
            url : `/api/v1/tasks`,
            method : 'GET',
        });
        return res;
    }catch (e) {
        CommonController.notificationErrorMessage(e, 5);
    }
}
export {
    submitBasicConfig,
    uploadFile,
    updateTaskConfig,
    getTaskList
};