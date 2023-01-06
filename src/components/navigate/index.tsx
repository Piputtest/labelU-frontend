import React, { useEffect, useState } from 'react';
import currentStyles from './index.module.scss';
import { Breadcrumb } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import commonController from '../../utils/common/common';
import constants from '../../constants';
import AnnotationTips from '../../components/annotationTips';
import { getTask } from '../../services/samples'
import HelpTips from "../helpTips";
import { UserOutlined } from '@ant-design/icons'
const Homepage = (props : any)=>{
    // const username = useSelector(commonController.getUsername);
    let username = localStorage.getItem('username');
    const [isShowHelp, setIsShowHelp] = useState(false);
    const navigate = useNavigate();
    let location  = useLocation();
    // const crumbs  : any = {
    //     '/tasks' : (<Breadcrumb.Item>
    //         <Link to = ''>任务列表</Link>
    //     </Breadcrumb.Item>),
    //     '/tasks/0/edit/basic' : (
    //         <React.Fragment>
    //             <Breadcrumb.Item>
    //                 <Link to = '/taskList'>任务列表</Link>
    //             </Breadcrumb.Item>
    //         </React.Fragment>
    //     ),
    //     '/taskList/task/taskAnnotation' : (
    //         <React.Fragment>
    //             <Breadcrumb.Item>
    //                 <Link to = '/taskList'>任务列表</Link>
    //             </Breadcrumb.Item>
    //             <Breadcrumb.Item>
    //                 <Link to = '/taskList/task'>任务</Link>
    //             </Breadcrumb.Item>
    //             <Breadcrumb.Item>
    //                 开始标注
    //             </Breadcrumb.Item>
    //         </React.Fragment>
    //     ),
    //     '/taskList/createTask' : (
    //         <React.Fragment>
    //             <Breadcrumb.Item>
    //                 <Link to = '/taskList'>任务列表</Link>
    //             </Breadcrumb.Item>
    //             <Breadcrumb.Item>
    //                新建任务
    //             </Breadcrumb.Item>
    //         </React.Fragment>
    //     ),
    //     '/taskList/createTask/inputInfoConfig' : (
    //         <React.Fragment>
    //             <Breadcrumb.Item>
    //                 <Link to = '/taskList'>任务列表</Link>
    //             </Breadcrumb.Item>
    //             <Breadcrumb.Item>
    //                 新建任务
    //             </Breadcrumb.Item>
    //         </React.Fragment>
    //     ),
    //     '/taskList/createTask/inputData' : (
    //         <React.Fragment>
    //             <Breadcrumb.Item>
    //                 <Link to = '/taskList'>任务列表</Link>
    //             </Breadcrumb.Item>
    //             <Breadcrumb.Item>
    //                 新建任务
    //             </Breadcrumb.Item>
    //         </React.Fragment>
    //     ),
    //     '/taskList/createTask/annotationConfig' : (
    //         <React.Fragment>
    //             <Breadcrumb.Item>
    //                 <Link to = '/taskList'>任务列表</Link>
    //             </Breadcrumb.Item>
    //             <Breadcrumb.Item>
    //                 新建任务
    //             </Breadcrumb.Item>
    //         </React.Fragment>
    //     )
    // }

    // const [taskName, setTaskName] = useState('');
    const [breadcrumbItems, setBreadcrumbItems] = useState<any>((<Breadcrumb.Item>
        <Link to = '/tasks'>任务列表</Link>
    </Breadcrumb.Item>));
    const getBreadcrumb = (pathname : string, taskName ?: string )=>{
        let result = (<Breadcrumb.Item>
            <Link to = '/tasks'>任务列表</Link>
        </Breadcrumb.Item>);
        switch (pathname) {
            case '/tasks' :
                setIsShowAnnotationTips(false);
                setIsShowHelp(true);
                result = (<Breadcrumb.Item>
                    <Link to = ''>任务列表</Link>
                </Breadcrumb.Item>);
                break;
            default :

                let pathnames = pathname.split('/');
                if(pathnames[1] === 'tasks' && pathnames[2] === '0' && pathnames[3] === 'edit' && pathnames[4] === 'basic'){
                    setIsShowAnnotationTips(false);
                    setIsShowHelp(false);
                    result = (
                        <React.Fragment>
                            <Breadcrumb.Item>
                                <Link to = {constants.urlToTasks}>任务列表</Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                新建任务
                            </Breadcrumb.Item>
                        </React.Fragment>
                    )
                }
                if(pathnames[1] === 'tasks' && pathnames[2] !== '0' && pathnames[3] === 'edit'
                    && (pathnames[4] === 'upload' || pathnames[4] === 'config')){
                    setIsShowAnnotationTips(false);
                    setIsShowHelp(false);
                    result = (
                        <React.Fragment>
                            <Breadcrumb.Item>
                                <Link to = {constants.urlToTasks}>任务列表</Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                编辑任务
                            </Breadcrumb.Item>
                        </React.Fragment>
                    )
                }

                if (pathnames.length == 3 && !isNaN(parseInt(pathnames[2]))) {
                    setIsShowAnnotationTips(false);
                    setIsShowHelp(false);

                    result = (
                        <React.Fragment>
                            <Breadcrumb.Item>
                                <Link to = {constants.urlToTasks}>任务列表</Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                {/*任务{pathnames[2]}*/}
                                {taskName}
                            </Breadcrumb.Item>
                        </React.Fragment>
                    )
                }
                if(pathnames[1] === 'tasks' && !isNaN(parseInt(pathnames[2]))
                    && pathnames[3] === 'samples'
                    &&  !isNaN(parseInt(pathnames[4])) ){
                    setIsShowAnnotationTips(true);
                    setIsShowHelp(false);
                    result = (
                        <React.Fragment>
                            <Breadcrumb.Item>
                                <Link to = {constants.urlToTasks}>任务列表</Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                <Link to = {`/tasks/${pathnames[2]}`}>{taskName}</Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                开始标注
                            </Breadcrumb.Item>
                        </React.Fragment>
                    )
                }
                break;
        }
        return result;
    }
    const [isShowAnnotationTips, setIsShowAnnotationTips] = useState(false);
    const [taskTips, setTaskTips] = useState('');
    useEffect(()=>{
        if (location.pathname) {
            let pathnames = window.location.pathname.split('/');
            if(pathnames[2] && pathnames[2] !== '0'){
                getTask(parseInt(pathnames[2])).then(
                    (res:any)=>{
                        if (res.status === 200) {
                            // setTaskName(res.data.data.name);
                            let taskName = res.data.data.name;
                            setTaskTips(res.data.data.tips);
                            setBreadcrumbItems(getBreadcrumb(location.pathname,  taskName));
                        }else{
                            commonController.notificationErrorMessage({
                                message : '导航条获取任务数据出错'
                            },1)
                        }
                    }).catch(error=>commonController.notificationErrorMessage(error,1))
            }else{
                setBreadcrumbItems(getBreadcrumb(location.pathname));
            }
        }else{
            commonController.notificationErrorMessage({message : '地址不正确'}, 1)
        }

    },[location])
    const [isShowSignOut, setIsShowSignOut] = useState(false);
    const signOut = (e: any)=>{
        e.stopPropagation();
        e.nativeEvent.stopPropagation();
        e.preventDefault();
        localStorage.setItem('username','');
        localStorage.setItem('token','');
        navigate('/login')
    }
    return (<div className={currentStyles.outerFrame}>
        <div className = {currentStyles.left}>
            <div className = {currentStyles.logo}>
            </div>
            {/*<div className = {currentStyles.shortCutButton}></div>*/}
            <div className = {currentStyles.breadcrumb}>
                <Breadcrumb>
                    {breadcrumbItems}
                </Breadcrumb>
            </div>
        </div>
        <div className = {currentStyles.right}>
            {isShowHelp && <HelpTips taskTips = {taskTips}/>}
            {isShowAnnotationTips && <AnnotationTips />}
            <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <div
                 onClick = {commonController.debounce(()=>{setIsShowSignOut(!isShowSignOut)}, 100)}

            className = {currentStyles.signOut}>
                <div>{username}&nbsp;&nbsp;<img src='/src/icons/personal.svg' /> </div>
            </div>
        </div>
        {isShowSignOut && <div className = { currentStyles.signOutItem }
                               onClick={signOut}>退出</div>}
    </div>)
}
export  default Homepage;
