import { useSqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
import { useUserStoreWithOut } from '/@/store/modules/user';

export const useTodoTasksQueryDto = () => {
  const userStore = useUserStoreWithOut();
  const userInfo = userStore.getUserInfo;
  const { getSqlQueryDto, resetSqlQueryDto, setPage, appendQueryList } = useSqlQueryDto({
    sqlPageAndSortSumDto: {
      page: { pageNum: 1, pageSize: 10 },
      queryList: [
        {
          param: 'or',
          type: 'or',
          value: [
            orParamsFormatter(
              " ((FIND_IN_SET('" +
                userInfo.account +
                "',REPLACE(waitDealtWith.ASSIGNEE_,'biddingCompanySupplierUser_','')) and (if((waitDealtWith.applyObjectType='con_contract' and (select ACT_NAME_ from act_ru_actinst where PROC_INST_ID_=waitDealtWith.PROC_INST_ID_ and ACT_TYPE_='userTask' AND END_TIME_ is NULL)='第三方会签-全通过'),(SELECT count(id) FROM sys_audit_records where ObjectId = waitDealtWith.processObjectId and ObjectName = waitDealtWith.applyObjectType and Frequency  = (select IFNULL(max(frequency),0) from sys_audit_records where objectName = waitDealtWith.applyObjectType and ObjectId =waitDealtWith.processObjectId) and userId = " +
                userInfo.id +
                " and ProcessId=(select ProcessId from con_contract where id =waitDealtWith.processObjectId) AND AuditOpinion is not NULL and result != 3 )=0,if((waitDealtWith.applyObjectType='pro_acceptance' and (select ACT_NAME_ from act_ru_actinst where PROC_INST_ID_=waitDealtWith.PROC_INST_ID_ and ACT_TYPE_='userTask' AND END_TIME_ is NULL)='验收'),(SELECT count(id) FROM sys_audit_records where ObjectId = waitDealtWith.processObjectId and ObjectName = waitDealtWith.applyObjectType and Frequency  = (select IFNULL(max(frequency),0) from sys_audit_records where objectName = waitDealtWith.applyObjectType and ObjectId =waitDealtWith.processObjectId) and userId = " +
                userInfo.id +
                " and ProcessId=(select ProcessId from pro_acceptance where id =waitDealtWith.processObjectId) AND AuditOpinion is not NULL and result != 3 )=0,1=1)))) or (select count(id) from sys_user where IfDelete=0 and UseMark=1 and ApproveStatus=1 and DepId=REPLACE(waitDealtWith.ASSIGNEE_,'depHeader_','') and id=" +
                userInfo.id +
                " and FIND_IN_SET((select id from sys_role where `Code`= (select depHeadCode from config_baseinfo limit 0,1) and IfDelete=0 and UseMark=1),RoleIds))>0 or ((select count(id) from sys_user where IfDelete=0 and UseMark=1 and ApproveStatus=1 and DepId=REPLACE(waitDealtWith.ASSIGNEE_,'depHeader_','') and FIND_IN_SET((select id from sys_role where `Code`= (select depHeadCode from config_baseinfo limit 0,1) and IfDelete=0 and UseMark=1),RoleIds))=0 and (select count(u.id) from Sys_DepAndUser d inner join sys_user u on d.UserId=u.id where u.IfDelete=0 and u.UseMark=1 and u.ApproveStatus=1 and d.DepId=REPLACE(waitDealtWith.ASSIGNEE_,'depHeader_','') and u.id=" +
                userInfo.id +
                ' and FIND_IN_SET((select id from sys_role where `Code`= (select directoChargeCode from config_baseinfo limit 0,1) and IfDelete=0 and UseMark=1),u.RoleIds))>0) or waitDealtWith.ASSIGNEE_ in (select code from sys_role where ifdelete=0 and usemark=1 and FIND_IN_SET(id,(select RoleIds from sys_user where id=' +
                userInfo.id +
                '))))',
            ),
          ],
        },
      ],
      sorts: [
        {
          dir: 'desc',
          prop: 'waitDealtWith.CREATE_TIME_',
        },
        {
          dir: 'desc',
          prop: 'waitDealtWith.id_',
        },
      ],
      sumList: ['waitDealtWith.tagModuleId'],
    },
  });

  const {
    appendQueryList: appendQueryListAlreadyDone,
    getSqlQueryDto: getSqlQueryDtoAlreadyDone,
    resetSqlQueryDto: resetSqlQueryDtoAlreadyDone,
    setPage: setPageAlreadyDone,
    setSorts: setSortsAlreadyDone,
  } = useSqlQueryDto({
    sqlPageAndSortSumDto: {
      // queryList: [{ param: 'alreadyDone.tagModuleId', type: 'equal', value: [1] }],
      queryList: [],
      sorts: [
        {
          dir: 'desc',
          prop: 'alreadyDone.LAST_UPDATED_TIME_',
        },
        {
          dir: 'desc',
          prop: 'alreadyDone.id_',
        },
      ],
      sumList: ['alreadyDone.tagModuleId'],
    },
  });

  return {
    getSqlQueryDto,
    resetSqlQueryDto,
    setPage,
    appendQueryList,
    appendQueryListAlreadyDone,
    getSqlQueryDtoAlreadyDone,
    resetSqlQueryDtoAlreadyDone,
    setPageAlreadyDone,
    setSortsAlreadyDone,
  };
};

export const useTodoTaskActionColumn = (reload: Fn | undefined, setProps: Fn) => {
  const tabChangeHandler = (tabKey) => {
    reload?.();
    // 设置操作列
    const column: any = {
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      slots: {
        customRender: 'action',
      },
    };
    switch (tabKey) {
      case 0:
        column.width = 120;
        break;
      case 1:
        column.width = 0;
        column.slots = undefined;
        break;
      case 2:
        column.width = 60;
        break;
      default:
        break;
    }
    setProps({
      actionColumn: column,
    });
  };
  return {
    tabChangeHandler,
  };
};
