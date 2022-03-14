<template>
  <BasicDrawer v-bind="$attrs" @register="register" :title="getTitle" width="70%">
    <CollapseContainer class="pd-20" title="专家信息" :canExpan="false">
      <BasicForm @register="registerForm" />
      <div class="flex justify-center">
        <a-button class="!ml-4" type="primary" @click="handelSubmit"> 保存 </a-button>
      </div>
    </CollapseContainer>
    <CollapseContainer class="pd-20" title="绑定专业" :canExpan="false" v-if="isUpdateRef">
      <BasicForm @register="registerBindForm" />
      <div class="flex justify-center">
        <a-button @click="resetBindFields"> 重置 </a-button>
        <a-button class="!ml-4" type="primary" @click="okSubmit"> 确定 </a-button>
      </div>
      <BasicTable @register="registerTable">
        <template #action="{ record }">
          <TableAction
            :actions="[
              {
                icon: '',
                label: '删除',
                color: 'error',
                onClick: handleDelete.bind(null, record),
              },
            ]"
          />
        </template>
      </BasicTable>
    </CollapseContainer>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { computed, ref, unref, toRaw } from 'vue';
  import { editExpertFormSchema, bindingTableSchema, bindingFormSchema } from '../schemas';
  import { CollapseContainer } from '/@/components/Container';
  import { useDrawerInner, BasicDrawer } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { debouncePromise } from '/@/utils/commonServe';
  import { checkMobileRepeat, checkUserRepeat } from '/@/api/demo/system';
  import {
    getUserById,
    saveUser,
    getUserExtendById,
    deleteExpertResearchAreaById,
    saveExpertResearchArea,
    getExpertResearchAreaPageByQueryDto,
  } from '/@/api/libraryManager/libExpert';
  import { LibExpertI } from '/@/api/libraryManager/model/libExpertModel';
  import { useConfigStore } from '/@/store/modules/config';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  // state
  const isUpdateRef = ref<boolean>(false); // 是否更新
  const isBindUpdateRef = ref<boolean>(false); // 是否更新
  let cacheUpdateExpertInfo: Nullable<LibExpertI> = null; // 暂存的 cacheUpdateExpertInfo 的对象
  const { createConfirm, createMessage, createConfirmPromise } = useMessage();
  const configStore = useConfigStore();
  const isSchoolExpert = ref(0);
  const getTitle = computed<string>(() => {
    return isUpdateRef.value ? '编辑专家' : '添加专家';
  });
  const recordBindId = ref<number>(); // 是否更新
  const [
    registerBindForm,
    { getFieldsValue: getFieldsBindValue, validate: validateBind, resetFields: resetBindFields },
  ] = useForm({
    schemas: bindingFormSchema(),
    labelWidth: 115,
    showActionButtonGroup: false,
  });
  const emit = defineEmits(['success']);
  const [registerForm, { getFieldsValue, validate, resetFields, setFieldsValue, updateSchema }] =
    useForm({
      schemas: editExpertFormSchema(),
      labelWidth: 115,
      showActionButtonGroup: false,
    });
  const [register, { changeLoading, changeOkLoading, closeDrawer }] = useDrawerInner(
    async (data) => {
      try {
        resetFields(); // 重置表单
        resetBindFields(); // 重置表单
        cacheUpdateExpertInfo = null;
        changeLoading(true);
        const { isUpdate } = data;
        isUpdateRef.value = Boolean(isUpdate) || false;
        isBindUpdateRef.value = Boolean(isUpdate) || false;
        if (isUpdate) {
          // 如果编辑，重新拉取数据
          const {
            record: { id: recordId },
          } = data;
          const {
            userExtend: { id: userExtendId },
          } = data;
          const {
            record: { ifSchoolExpert: ifSchoolExpert },
          } = data;
          recordBindId.value = recordId;
          isSchoolExpert.value = ifSchoolExpert;
          const _roleInfo = await getUserById(recordId);
          const _userExtendInfo = await getUserExtendById(userExtendId);
          // 获取权限
          cacheUpdateExpertInfo = _roleInfo;
          // 修改参数后回填
          setFieldsValue({
            ..._roleInfo,
            ..._userExtendInfo,
            ...{
              schoolingRecord: _userExtendInfo.schoolingRecord?.id,
              academicDegree: _userExtendInfo.academicDegree?.id,
              academicTitle: _userExtendInfo.academicTitle?.id,
            },
          });
        }
        // 添加 rules 规则
        updateSchema({
          field: 'account',
          rules: [
            { required: true, message: '请输入账号', trigger: 'blur' },
            {
              trigger: 'blur',
              validator: debouncePromise(async (_, value) => {
                const _role: LibExpertI = {
                  account: value,
                };
                if (cacheUpdateExpertInfo?.id) {
                  _role.id = cacheUpdateExpertInfo.id;
                }
                let regExp = /^[\u4e00-\u9fa5A-Za-z0-9]{2,20}$/;
                if (regExp.test(value) === false) {
                  return Promise.reject('请输入2-20位字符（不允许纯空格）');
                }
                if (regExp.test(value) === true) {
                  const bool = await checkUserRepeat(_role);
                  if (bool) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject('账号重复！');
                  }
                }
              }, 800),
            },
          ],
        });
        updateSchema({
          field: 'mobile',
          rules: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            {
              trigger: 'blur',
              validator: debouncePromise(async (_, value) => {
                const _role: LibExpertI = {
                  mobile: value,
                };
                if (cacheUpdateExpertInfo?.id) {
                  _role.id = cacheUpdateExpertInfo.id;
                }
                _role.role = 3;
                let regExp = /^1\d{10}$/;
                if (regExp.test(value) === false) {
                  return Promise.reject('请输入11位手机号码');
                }
                if (regExp.test(value) === true) {
                  const bool = await checkMobileRepeat(_role);
                  if (bool) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject('手机号重复！');
                  }
                }
              }, 800),
            },
          ],
        });
        reload();
      } finally {
        changeLoading(false);
      }
    },
  );
  const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage } = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      queryList: [{ param: 'ifDelete', type: 'equal', value: [0] }],
      ifCustomHql: true,
      dataFieldList: ['expertResearchArea', 'expertResearchArea.id'],
      sorts: [{ dir: 'asc', prop: 'id' }],
    },
  });
  const [registerTable, { reload }] = useTable({
    title: '专家列表',
    api: getExpertResearchAreaPageByQueryDto,
    columns: bindingTableSchema,
    beforeFetch: (queryInfo: any) => {
      resetHqlQueryDto(); // 先重置
      if (queryInfo.page && queryInfo.pageSize) {
        setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
      }
      appendQueryList({ param: 'userId', type: 'equal', value: [recordBindId.value] });
      const queryDto = getHqlQueryDto();
      return queryDto;
    },
    useSearchForm: false,
    showTableSetting: true,
    tableSetting: {
      // 是否显示刷新按钮
      redo: true,
      // 是否显示尺寸调整按钮
      size: true,
      // 是否显示字段调整按钮
      setting: true,
      // 是否显示全屏按钮
      fullScreen: true,
    },
    bordered: true,
    showIndexColumn: true,
    actionColumn: {
      width: 80,
      title: '操作',
      dataIndex: 'action',
      slots: {
        customRender: 'action',
      },
      fixed: undefined,
    },
  });
  const handelSubmit = async () => {
    try {
      changeOkLoading(true);
      await validate(); // 验证
      const formData = getFieldsValue();
      // 处理数据id
      formData.id = cacheUpdateExpertInfo?.id;
      const expertform = {
        user: {
          id: formData.id ? formData.id : null,
          account: formData.account,
          perName: formData.perName,
          citId: formData.citId, //身份证号
          mobile: formData.mobile,
          sexCode: formData.sexCode, // 性别
          useMark: formData.useMark,
          orgName: formData.orgName,
          role: 3,
          orgId: isSchoolExpert.value ? configStore.GET_CONFIG_BASEINFO.orgId : null,
        },
        userExtend: {
          email: formData.email,
          schoolingRecord: formData.schoolingRecord ? { id: formData.schoolingRecord } : null, // 专家学历
          academicDegree: formData.academicDegree ? { id: formData.academicDegree } : null, // 专家学位
          academicTitle: formData.academicTitle ? { id: formData.academicTitle } : null, // 专家职称
          academicTitleGetDate: formData.academicTitleGetDate, // 职称获得时间
          researchResult: formData.researchResult, // 研究成果
        },
      };
      // 保存
      const resData = await saveUser(expertform as LibExpertI);
      isUpdateRef.value = Boolean(resData) || false;
      recordBindId.value = resData.user.id;
      cacheUpdateExpertInfo = null; // 重置
      emit('success');
    } finally {
      changeOkLoading(false);
    }
  };
  const okSubmit = async () => {
    try {
      changeOkLoading(true);
      await validateBind(); // 验证
      const formBindData = getFieldsBindValue();
      const expertResearchArea = {
        userId: recordBindId.value,
        expertCategoryId: { id: formBindData.expertCategory },
        expertTypes: formBindData.expertType,
      };
      // submit formBindData
      await saveExpertResearchArea(expertResearchArea as LibExpertI);
      // 如果新增 createConfirm 询问是否继续添加
      if (!unref(isBindUpdateRef)) {
        // 新增
        createConfirm({
          iconType: 'warning',
          title: '提示',
          content: '添加成功，是否继续添加？',
          onOk: async () => {
            resetFields();
            changeOkLoading(false);
          },
          onCancel: () => {
            closeDrawer();
            changeOkLoading(false);
          },
        });
        emit('success');
        return;
      }
      closeDrawer();
      reload(); // 回调列表数据
      emit('success');
    } finally {
      changeOkLoading(false);
    }
  };
  // 删除
  const handleDelete = async (record) => {
    await createConfirmPromise({
      content: '确认删除吗？',
    });
    const expertId = toRaw(record.expertResearchArea.id);
    await deleteExpertResearchAreaById(expertId);
    createMessage.success('删除成功！');
    reload();
  };
</script>
