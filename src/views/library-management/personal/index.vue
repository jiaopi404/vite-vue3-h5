<template>
  <div class="page-test-page_cyk">
    <CollapseContainer class="pd-20" title="个人资料" :canExpan="false">
      <div class="pro-file-content">
        <div class="user">
          <div class="user-avatar">
            <span class="user-avatar-border"></span>
            <div class="avatarUpload">
              <CropperAvatar :value="userImg" :showBtn="false" />
            </div>
            <span class="user-avatar-border"></span>
          </div>
          <div class="user-name">
            <span class="user-name-value"> {{ basicData?.perName }}</span>
          </div>
          <div class="user-time-and-department">
            <div
              class="user-department"
              v-if="resData?.user?.orgName || basicData?.department?.name"
            >
              <div class="department">{{
                resData.user ? resData?.user?.orgName : basicData?.department?.name
              }}</div>
            </div>
          </div>
          <div class="user-password">
            <a class="user-password-value" @click="updatePassWord()">修改账户密码</a>
          </div>
        </div>
        <div class="basic-info">
          <div class="basic-info-title">
            <div class="font">基本信息</div>
          </div>
          <div class="basic-info-content">
            <div class="account basic-info-content-item">
              <div class="label">用户账号</div>
              <div class="value">{{ basicData?.account }}</div>
            </div>
            <div class="sex basic-info-content-item">
              <div class="label">性别</div>
              <div class="value">{{ basicData?.sexCode === 1 ? '男' : '女' }} </div>
            </div>
            <div class="mobile basic-info-content-item">
              <div class="label"
                >手机号<span @click="updateMobile()"> <Icon icon="clarity:note-edit-line" /> </span
              ></div>
              <div class="value">{{ basicData?.mobile }}</div>
            </div>
            <div class="addDateTime basic-info-content-item">
              <div class="label">注册日期</div>
              <div class="value">{{ renderTime(basicData?.addDateTime) }} </div>
            </div>
          </div>
        </div>
      </div>
    </CollapseContainer>
    <CollapseContainer
      class="pd-20"
      :title="getUserInfo && getUserInfo?.role === 3 ? '个人详情' : '公司信息'"
      :canExpan="false"
      v-if="getUserInfo && getUserInfo?.role !== 2"
    >
      <BasicForm @register="registerForm" ref="userDetailFormRef" />
      <AButton class="lly" type="primary" @click="savePerson">保存</AButton>
    </CollapseContainer>
    <CollapseContainer
      class="pd-20"
      title="绑定专业"
      :canExpan="false"
      v-if="getUserInfo && getUserInfo?.role === 3"
    >
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
    <CollapseContainer
      class="pd-20 file-list"
      v-if="
        fileList.length > 0 &&
        (getUserInfo?.role === 1 || getUserInfo?.role === 5 || getUserInfo?.role === 3)
      "
      :canExpan="false"
    >
      <template #title>
        资质信息
        <Tooltip placement="right">
          <template #title>
            1. 单次上传文件最大个数：{{ limitMaxAmount }}<br />
            2. 单个上传文件最大上限大小：{{ configSize }}M<br />
            3. 上传文件格式：{{ acceptType }}<br />
          </template>
          <Icon icon="ant-design:question-circle-outlined" class="fileIcon" />
        </Tooltip>
        <span style="color: #ed6f6f"
          >(温馨提示：已通过审核用户在修改个人信息后，需要管理员重新审核，请谨慎操作。)</span
        >
      </template>
      <Row>
        <Col :span="12" v-for="(item, index) in fileList" :key="item.fileType.id">
          <LxFileUpload
            v-if="fileList.length > 0"
            @change="upload"
            :key="index"
            :proId="getUserInfo.id"
            :approveStatus="approveStatus"
            :name="item.fileType.name"
            :fileType="item.fileType"
            :fileList="item.list"
            :identifier="identifier"
            :skip="1"
          />
        </Col>
      </Row>
    </CollapseContainer>
    <EditDrawerVue @register="registerDrawer" />
    <EditMobileDrawerVue @register="registerDrawer1" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { CropperAvatar } from '/@/components/Cropper';
  import { computed, onMounted, ref, toRaw } from 'vue';
  import { renderTime } from '/@/components/Time';
  import { useDrawer } from '/@/components/Drawer';
  import { useUserStore } from '/@/store/modules/user';
  import { debouncePromise, waitForPromise } from '/@/utils/commonServe';
  import { useConfigStore } from '/@/store/modules/config';
  import { CollapseContainer } from '/@/components/Container';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import EditDrawerVue from './components/EditDrawer.vue';
  import EditMobileDrawerVue from './components/EditMobileDrawer.vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { findByCode, checkUserRepeat, checkMobileRepeat } from '/@/api/demo/system';
  import { LibExpertI } from '/@/api/libraryManager/model/libExpertModel';
  import {
    saveUser,
    getUserExtendByUserId,
    getUserById,
    deleteExpertResearchAreaById,
    saveExpertResearchArea,
    getExpertResearchAreaPageByQueryDto,
  } from '/@/api/libraryManager/libExpert';
  import {
    editExpertFormSchema,
    bindingTableSchema,
    bindingFormSchema,
  } from '../expert_4_11_3/aleady-review_4_11_3_2/schemas'; // 专家
  import { editSupplierFormSchema } from '../supplier_4_11_2/supplier-already-review_4_11_2_2/schemas'; // 供应商
  import { editBiddingFormSchema } from '../bidding-company_4_11_1/bidding-company-already-review_4_11_1_2/schemas'; // 招标公司
  import {
    getBiddingCompanyByUserId,
    saveBiddingCompanyAndUser,
    getProFileMapGroupByFileTypeNameFromId,
  } from '/@/api/review-node/biddingCompany';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useMessage } from '/@/hooks/web/useMessage';
  import LxFileUpload from '../../../components/LxComponents/LxUploadTest/LxFileUpload.vue';
  import { Col, Row, Tooltip } from 'ant-design-vue';
  import Icon from '../../../components/Icon/src/Icon.vue';
  import componentSetting from '/@/settings/componentSetting';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerDrawer1, { openDrawer: openDrawer1 }] = useDrawer();
  const publicPath = import.meta.env.VITE_PUBLIC_PATH || '/';
  const userStore = useUserStore();
  const getUserInfo = computed(() => {
    return Object.keys(userStore.getUserInfo).length === 0 ? null : userStore.getUserInfo;
  });
  const userDetailFormRef = ref<any>(null);
  let cacheUpdateExpertInfo: Nullable<LibExpertI> = null; // 暂存的 cacheUpdateExpertInfo 的对象
  const configStore = useConfigStore();
  const { createMessage, createConfirmPromise } = useMessage();
  const userImg = ref<any>({});
  const resData = ref<any>({});
  const basicData = ref<any>({});
  const fileList: any = ref([]);
  const limitMaxAmount = ref(0);
  const configSize = ref(0);
  const approveStatus = ref(0);
  const acceptType = ref();
  const identifier = ref('sys_user');
  const { lxBasicUpload: lxBasicUploadSetting } = componentSetting;
  const getAccept = computed(() => {
    let _settingImg = lxBasicUploadSetting?.acceptImgExt ?? [];
    let _settingFile = lxBasicUploadSetting?.acceptFileExt ?? [];
    return [..._settingImg, ..._settingFile].join(',');
  });
  limitMaxAmount.value = configStore.GET_CONFIG_BASEINFO?.uploadImageMaxCount ?? '';
  configSize.value = configStore.GET_CONFIG_BASEINFO?.uploadImageMaxSize ?? '';
  acceptType.value = getAccept.value.replace(/\./g, '  ');
  const [registerForm, { validate, getFieldsValue, updateSchema, setFieldsValue, clearValidate }] =
    useForm({
      labelWidth: 150,
      schemas:
        getUserInfo.value?.role === 3
          ? editExpertFormSchema()
          : getUserInfo.value?.role === 1
          ? editSupplierFormSchema(true)
          : getUserInfo.value?.role === 5
          ? editBiddingFormSchema()
          : undefined,
      baseColProps: { span: 10 },
      showActionButtonGroup: false,
      baseRowStyle: {
        padding: '20px 200px 50px',
        margin: '20px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: '#F4F6F9',
      },
    });
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
      appendQueryList({ param: 'userId', type: 'equal', value: [getUserInfo.value?.id] });
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
  const [
    registerBindForm,
    { getFieldsValue: getFieldsBindValue, validate: validateBind, resetFields: resetBindFields },
  ] = useForm({
    schemas: bindingFormSchema(),
    labelWidth: 115,
    showActionButtonGroup: false,
  });

  const formActionAfterFormMounted = async (action, ...payload) => {
    if (getUserInfo.value?.role === 2) {
      return;
    }
    await waitForPromise(() => userDetailFormRef.value, 3000);
    action(...payload);
  };
  onMounted(async () => {
    fileList.value = await getProFileMapGroupByFileTypeNameFromId({
      objectId: getUserInfo.value?.id,
      objectType: getUserInfo.value?.role === 3 ? 3 : 4,
      objectName: 'sys_user',
    });
    await handleSuccess();
    clearValidate();
    // 添加 rules 规则
    formActionAfterFormMounted(updateSchema, {
      field: 'account',
      rules: [
        { required: true, message: '请输入账号', trigger: 'blur' },
        {
          trigger: 'blur',
          validator: debouncePromise(async (_, value) => {
            const _role: LibExpertI = {
              account: value,
            };
            if (cacheUpdateExpertInfo?.user?.id) {
              _role.id = cacheUpdateExpertInfo.user.id;
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
    formActionAfterFormMounted(updateSchema, {
      field: 'mobile',
      rules: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        {
          trigger: 'blur',
          validator: debouncePromise(async (_, value) => {
            const _role: LibExpertI = {
              mobile: value,
            };
            if (cacheUpdateExpertInfo?.user?.id) {
              _role.id = cacheUpdateExpertInfo.user.id;
            }
            _role.role = getUserInfo.value?.role;
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
  });
  async function getUsersById() {
    const res = await getUserById(getUserInfo.value?.id);
    basicData.value = res;
    if (res.pic) {
      userImg.value = res.pic;
    } else {
      userImg.value =
        res.sexCode === 1
          ? `${publicPath}resource/img/user-card/male.jpg`
          : `${publicPath}resource/img/user-card/female.jpg`;
    }
  }
  async function upload() {
    try {
      fileList.value = await getProFileMapGroupByFileTypeNameFromId({
        objectId: cacheUpdateExpertInfo?.user?.id,
        objectType: getUserInfo.value?.role === 3 ? 3 : 4,
        objectName: 'sys_user',
      });
    } catch (error) {}
  }
  const okSubmit = async () => {
    try {
      await validateBind(); // 验证
      const formBindData = getFieldsBindValue();
      const expertResearchArea = {
        userId: getUserInfo.value?.id,
        expertCategoryId: { id: formBindData.expertCategory },
        expertTypes: formBindData.expertType,
      };
      // submit formBindData
      await saveExpertResearchArea(expertResearchArea as LibExpertI);
      resetBindFields();
      reload(); // 回调列表数据
    } finally {
      console.log('error');
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
  async function savePerson() {
    try {
      let formData = {};
      if (getUserInfo.value?.role !== 2) {
        await validate();
        formData = getFieldsValue();
      }
      let supplierId = await findByCode(configStore.GET_CONFIG.configInfo.configBaseInfo.supplier);
      let repairerId = await findByCode(configStore.GET_CONFIG.configInfo.configBaseInfo.repairer);
      let biddingId = await findByCode(
        configStore.GET_CONFIG.configInfo.configBaseInfo.biddingCompany,
      );
      if (getUserInfo.value?.role === 3) {
        formData.id = cacheUpdateExpertInfo?.user?.id;
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
            approveStatus: 0,
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
        await saveUser(expertform as LibExpertI);
      } else {
        formData.id = cacheUpdateExpertInfo?.id;
        formData.userId = cacheUpdateExpertInfo?.user?.id;
        const expertform = {
          user: {
            id: formData.userId ? formData.userId : null,
            account: formData.account,
            perName: formData.perName,
            mobile: formData.mobile,
            sexCode: formData.sexCode, // 性别
            citId: formData.citId, //身份证号
            role: getUserInfo.value?.role,
            approveStatus: 0,
            roleIds:
              getUserInfo.value?.role === 1
                ? formData.ifSupplier && formData.ifRepairer
                  ? [supplierId.id, repairerId.id].toString()
                  : formData.ifSupplier
                  ? supplierId.id
                  : formData.ifRepairer
                  ? repairerId.id
                  : null
                : getUserInfo.value?.role === 5
                ? biddingId.id
                : null,
          },
          biddingCompany: {
            id: formData.id ? formData.id : null,
            name: formData.name,
            comlicCode: formData.comlicCode,
            legalperName: formData.legalperName,
            legalperCitId: formData.legalperCitId,
            legalperTel: formData.legalperTel,
            regtel: formData.regtel,
            useMark: formData.useMark,
            regfunAmount: formData.regfunAmount,
            regdate: formData.regdate,
            address: formData.address,
            officeAddress: formData.officeAddress,
            businessType: formData.businessType.toString(), // 公司业务类型
            depositBank: formData.depositBank,
            bankAccount: formData.bankAccount,
            majorScope: formData.majorScope,
            ifRepairer: getUserInfo.value?.role === 1 ? formData.ifRepairer : 0,
            ifSupplier: getUserInfo.value?.role === 1 ? formData.ifSupplier : 0,
          },
        };
        // 保存
        await saveBiddingCompanyAndUser(expertform as LibExpertI);
      }
      getUsersById();
      const _userExtendInfo =
        getUserInfo.value?.role === 3
          ? await getUserExtendByUserId(getUserInfo.value?.id)
          : await getBiddingCompanyByUserId(getUserInfo.value?.id);
      resData.value = _userExtendInfo;
      if (getUserInfo.value?.approveStatus === 1) {
        createMessage.success('您的账号正在审核中！');
        const userStore = useUserStoreWithOut();
        userStore.setToken(undefined);
        userStore.logout(true);
      } else {
        createMessage.success('保存完成！');
      }
    } catch (error) {
      console.log('error is', error);
    }
  }
  // 修改账户密码
  const updatePassWord = () => {
    openDrawer(true);
  };
  // 修改手机号
  const updateMobile = async () => {
    openDrawer1(true);
  };
  async function handleSuccess() {
    await getUsersById();
    if (
      getUserInfo.value?.role === 1 ||
      getUserInfo.value?.role === 5 ||
      getUserInfo.value?.role === 3
    ) {
      const _userExtendInfo =
        getUserInfo.value?.role === 3
          ? await getUserExtendByUserId(getUserInfo.value?.id)
          : await getBiddingCompanyByUserId(getUserInfo.value?.id);
      // 获取权限
      cacheUpdateExpertInfo = _userExtendInfo;
      resData.value = _userExtendInfo;
      // 修改参数后回填
      await formActionAfterFormMounted(setFieldsValue, {
        ..._userExtendInfo,
        ...{
          perName: basicData.value?.perName,
          account: basicData.value?.account,
          sexCode: basicData.value?.sexCode,
          orgName: basicData.value?.orgName,
          mobile: basicData.value?.mobile,
          useMark: basicData.value?.useMark,
          citId: basicData.value?.citId,
          businessType: _userExtendInfo.businessType?.split(','),
          schoolingRecord: _userExtendInfo?.schoolingRecord?.id,
          academicDegree: _userExtendInfo?.academicDegree?.id,
          academicTitle: _userExtendInfo?.academicTitle?.id,
        },
      });
    }
  }
</script>
<script lang="ts">
  import { defineComponent } from 'vue';
  export default defineComponent({
    name: 'RoleManagement',
  });
</script>
<style lang="less" scoped>
  .pd-20 {
    margin: 20px;
    position: relative;
  }
  .lly {
    position: absolute;
    left: 50%;
    bottom: 40px;
    transform: translateX(-50%);
  }
  .pro-file {
    padding: 24px;
    background: #f5f7f9;
    box-sizing: border-box;
    width: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    .tempBtn {
      margin-top: 5px;
    }
  }
  .pro-file-content {
    background: #ffffff;
    border-radius: 5px;
    padding: 30px;
    display: flex;
    flex-direction: row;
    .user {
      width: 30%;
      min-height: 280px;
      padding-top: 35px;
      display: flex;
      flex-direction: column;
      align-items: center;
      border: 1px solid #ccc;
      margin-right: 20px;
      .user-avatar {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        margin-bottom: 25px;
        .user-avatar-border {
          font-size: 64px;
          color: #5787e9;
          font-weight: 500;
        }
        .user-avatar-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 1px solid #5787e9;
        }
      }
      .user-name {
        margin-bottom: 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        .user-name-value {
          font-size: 18px;
          font-weight: bold;
          margin-right: 10px;
        }
        .user-name-icon {
          width: 20px;
          height: 20px;
        }
      }
      .user-time-and-department {
        margin-bottom: 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        .user-department {
          font-size: 18px;
          font-weight: bold;
          margin-right: 10px;
        }
        .department {
          font-size: 20px;
          font-weight: bold;
        }
      }
      .user-password {
        margin-bottom: 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        .user-password-value {
          font-size: 12px;
          font-weight: bold;
          margin-right: 10px;
        }
      }
    }
    .basic-info {
      width: 70%;
      display: flex;
      flex-direction: column;
      border: 1px solid #ccc;
      .basic-info-title {
        height: 60px;
        line-height: 60px;
        padding-left: 10px;
        border-bottom: 1px solid #ccc;
        .font {
          width: 100px;
          font-size: 20px;
          font-weight: bold;
          border-bottom: 2px solid #5787e9;
        }
      }
      .basic-info-content {
        display: flex;
        padding-top: 54px;
        margin-bottom: 70px;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        .basic-info-content-item {
          width: 25%;
          text-align: center;
        }
        .label {
          font-size: 16px;
          margin-bottom: 8px;
        }
        .value {
          font-size: 18px;
          font-weight: bold;
        }
      }
      .button-group {
        text-align: center;
      }
    }
  }
  .avatarUpload {
    position: relative;
    span {
      white-space: nowrap;
      position: absolute;
      bottom: -25px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
  .file-list {
    padding: 0 20px;
    :deep(.lx-collapse-container__body) {
      width: 100%;
    }
  }
  .fileIcon {
    display: flex;
    align-items: center;
    margin-left: 10px;
  }
</style>
