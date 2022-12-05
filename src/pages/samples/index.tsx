import React, { useState, useEffect } from 'react';
import currentStyles from './index.module.scss';
import commonStyles from '../../utils/common/common.module.scss';
import Statistical from '../../components/statistical';
import { Outlet, useNavigate } from "react-router-dom";
import Separator from '../../components/separator';
import { updateTaskConfig } from '../../services/createTask';
import constant from '../../constants';
import {connect, useSelector, useDispatch} from 'react-redux';
import GoToEditTask from "../goToEditTask";
import commonController from '../../utils/common/common';
import { Table, Pagination, Modal } from 'antd';
import { updateConfigStep } from '../../stores/task.store';
import {getTask, getSamples, deleteSamples, outputSamples, outputSample} from '../../services/samples';
import statisticalStyles from '../../components/statistical/index.module.scss';
import moment from "moment";
const Samples = (props : any)=>{
  let taskId = parseInt(window.location.pathname.split('/')[2]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let configStep = useSelector(state=>state.existTask.configStep );

  const steps = [{
    title : '基础配置',
    index : 1,
    contentUrl : './inputInfoConfig'
  },
    {

      title : '数据导入',
      index : 2,
      contentUrl : './inputData'
    },
    {

      title : '标注配置',
      index : 3,
      contentUrl : './annotationConfig'
    }
  ];
  const [current, setCurrent] = useState(0);

  const [deleteSampleIds, setDeleteSampleIds] = useState<any>([])
  const [pageInfo, setPageInfo] = useState({pageNo : 0, pageSize : 10});
  const deleteSamplesLocal = (sampleIds : number[])=>{
    setDeleteSampleIds(sampleIds);
    setIsModalShow(true);
  }
  const columns = [
    {
      title: '数据ID',
      dataIndex: 'id',
      key: 'id',
      // className : currentStyles.tableColumn
      // width: 80,
    },
    {
      title: '数据预览',
      dataIndex: 'data',
      key: 'packageID',
      render:(data : any)=> {
        let url = '';
        if(!data.urls){
          url = window.location.origin + '/src/img/example/bear1.webp';
        }else{
          for(let sampleId in data.urls){
            url = data.urls[sampleId];
          }
        }
        return <img src = {url} style = {{ width : '116px',height : '70px' }}/>
      }
      // width: 80,
    },
    {
      title: '标注情况',
      dataIndex: 'state',
      key: 'packageID',
      width: 80,
      render:(text : string)=>{
        let result = undefined;
        switch(text){
          case 'DONE' :
            result = (<div className = {currentStyles.leftTitleContentOption}>
              <div className = {statisticalStyles.leftTitleContentOptionBlueIcon}></div>
              <div className = {statisticalStyles.leftTitleContentOptionContent} >已标注</div>
            </div>);
            break;
          case 'NEW' :
            result = (<div className = {currentStyles.leftTitleContentOption}>
              <div className = {statisticalStyles.leftTitleContentOptionGrayIcon}></div>
              <div className = {statisticalStyles.leftTitleContentOptionContent} >未标注</div>
            </div>);
            break;
          case 'SKIPPED' :
            result = (<div className = {currentStyles.leftTitleContentOption}>
              <div className = {statisticalStyles.leftTitleContentOptionOrangeIcon}></div>
              <div className = {statisticalStyles.leftTitleContentOptionContent} >跳过</div>
            </div>);
            break;
        };
        return result;
      }
    },
    {
      title: '标注数',
      dataIndex: 'annotated_count',
      key: 'annotated_count',
      // width: 80,
    },
    {
      title: '标注者',
      dataIndex: 'created_by',
      key: 'created_by',
      render:(created_by: any)=>{
        return created_by.username;
      }
    },
    {
      title: '上次标注时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      // width : 310,
      render : (updated_at : any, record : any)=>{
        return moment(updated_at).format('YYYY-MM-DD HH:MM')
      }
    },
    {
      title: '',
      dataIndex: 'option',
      key: 'option',
      width: 180,
      render:(x : any, record : any)=>{
        return (<React.Fragment>
          {
            record.id === enterRowId && (<div className={ currentStyles.optionItem }>
              <div className={ currentStyles.optionItemEnter } onClick={ ()=>turnToAnnotate(record.id) }>进入标注</div>
              <div className={ currentStyles.optionItemDelete } onClick = {commonController.debounce(deleteSamplesLocal.bind(null,[record.id]),100)}>删除</div>
            </div>)
          }
        </React.Fragment>)
      }
    }
  ]
  const [showDatas, setShowDatas] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [isModalShow, setIsModalShow] = useState(false);
  const clickModalOk = ()=>{
    console.log(deleteSampleIds);
    deleteSamples(taskId,deleteSampleIds).then(res=>{
      if(res.status === 200){
        commonController.notificationSuccessMessage({message : '删除成功'},1);
        getSamplesLocal(Object.assign({},pageInfo,{pageNo : 0}));
      }else{
        commonController.notificationErrorMessage({message : '删除sample出错'},1);
      }
      }).catch(error=>{commonController.notificationErrorMessage({message : '删除sample出错'},1)})
    setIsModalShow(false);
    setDeleteSampleIds([]);

  }
  const clickModalCancel = ()=>{
    setIsModalShow(false);
  }
  const rowSelection = {
    onChange : (selectedKeys : any, selectedRows : any)=>{
      console.log(selectedKeys)
      setDeleteSampleIds(Object.assign([],deleteSampleIds,selectedKeys));
    },
    getCheckboxProps: (record: any) => {
      // console.log(record);
      return{
        disabled: false, // Column configuration not to be checked
        name: record.packageID,
        key : record.packageID
      }
    },
    selectedKeys : (selectedKeys : any, selectedRows : any)=>{
      console.log({selectedKeys, selectedRows})
    }
  }
  const turnToAnnotate = (sampleId : number)=>{
    navigate(`/tasks/${taskId}/samples/${sampleId}`)
  }
  const [total, setTotal] = useState(0);
  const getSamplesLocal = (params : any)=>{
    getSamples(taskId,params).then(res=>{
      if(res.status === 200){
        setShowDatas(res.data.data);
        setTotal(res.data['meta_data'].total);
      }else{
        commonController.notificationErrorMessage({message : '请求samples 出问题'}, 1)
      }
    }).catch(error=>{
      commonController.notificationErrorMessage(error, 1)
    });
  }
  const [taskStatus, setTaskStatus] = useState<any>(undefined);
  const getTaskLocal = ()=>{
    getTask(taskId).then(
      (res:any)=>{
        if(res.status === 200){
          let status = res.data.data.status;
          setTaskStatus(status);
        }else{
          commonController.notificationErrorMessage({message : '请求任务详情出错'},1);
        }
      }
    ).catch(error=>{
      commonController.notificationErrorMessage(error,1)
    })
  }
  useEffect(()=>{

    getTaskLocal()

    getSamplesLocal({pageNo : 0,pageSize : 10});


    // setShowDatas([{
    //   option : (<div className={ currentStyles.optionItem }>
    //     <div className={ currentStyles.optionItemEnter } onClick={ ()=>turnToAnnotate() }>进入标注</div>
    //     <div className={ currentStyles.optionItemDelete }>删除</div>
    //   </div>)
    // }])


  },[]);

  const changePage = (page : number, pageSize : number)=>{
    setPageInfo({
      pageNo : page - 1,
      pageSize: pageSize
    })
    getSamplesLocal({
      pageNo :  page - 1,
      pageSize
    })
  }
  const [enterRowId , setEnterRowId] = useState<any>(undefined);
  const onMouseEnterRow = (rowId : any)=>{
    setEnterRowId(rowId);
  }
  const onRow = (record : any, rowIndex : any)=>{
    return {
      onMouseEnter : (e: any)=>onMouseEnterRow(record.id),
      onMouseLeave : (e: any)=>setEnterRowId(undefined)
    }
  }
  const outputSamplesLocal = ()=>{
    outputSample(taskId, deleteSampleIds).then((res:any)=>{
          if(res.status === 200){

          }else{
            commonController.notificationErrorMessage({message : '请求导出数据出错'},1)
          }
      }
    ).catch((error:any)=>{commonController.notificationErrorMessage({message : '请求导出数据出错'},1)})
  }

  return (<div className={currentStyles.outerFrame}>
    <div className = {currentStyles.stepsRow}>
      {(taskStatus === 'DRAFT' || taskStatus === 'IMPORTED') && <GoToEditTask taskStatus = {taskStatus}/>}
      {/*{(taskStatus !== 'DRAFT' && taskStatus !== 'IMPORTED') && <Statistical />}*/}
      {/*delete*/}
      { <Statistical />}
    </div>
    <div className = { currentStyles.content }>
      <Table columns = {columns}
             dataSource={showDatas ? showDatas: []}
             pagination={false}
             loading = {dataLoading}
             rowKey = {record=>record.id}
             rowSelection = { rowSelection }
             onRow = {onRow}
      ></Table>
      <div className = { currentStyles.pagination }>
        <div className = { currentStyles.dataProcess}>
          <div className = { currentStyles.dataProcessDelete } onClick = {()=>{setIsModalShow(true)}}>批量删除</div>
          <div className = { currentStyles.dataProcessOutput } onClick = {commonController.debounce(outputSamplesLocal,100)}>批量数据导出</div>
        </div>
        <Pagination
            total = {total}
            showSizeChanger
            showQuickJumper
            onChange={changePage}
        />
      </div>

    </div>
    <Modal open = {isModalShow} onOk ={clickModalOk} onCancel={clickModalCancel} centered
    okText={'删除'} okButtonProps={{'danger' : true}}>
      <p><img src="/src/icons/warning.png" alt=""/>确认要删除这条数据吗？</p>
    </Modal>
  </div>)
}

const mapStateToProps = (state : any)=>{
  return state.toolsConfig;
};

const mapDispatchToProps = ()=>{

};

export  default connect(mapStateToProps)(Samples);
