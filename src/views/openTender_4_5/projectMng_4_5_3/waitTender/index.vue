<template>
  <div>
    <BasicTable @register="registerTable">
      <!-- <template #toolbar>
        <a-button>fun</a-button>
      </template> -->
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '查看报价供应商',
              color: 'success',
              ifShow: (_action) => {
                //const array = ['5', '6'];
                //return array.includes(record.procurementMethod.code);
                return false
              },
              onClick: handleEditor.bind(null, record),
            },
            {
              label: '转交',
              onClick: handleTransfer.bind(null, record),
              ifShow: () => {
                const role: any = userStore.role
                if ([1,5].includes(role)) {
                  return false;
                } else {
                  return true;
                }
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <LxTransferDrawer @register="registerDrawer" :objectType="2" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  /**
   * 待招标
   * proMngWaitTender
   * openTender_4_5/projectMng_4_5_3/waitTender/index.vue
   */
  import { defineComponent, computed } from 'vue';
  import { useRouter } from 'vue-router';
  // import { useMessage } from '/@/hooks/web/useMessage';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema, pageAndSort } from './WaitTender.data';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getDictionaryByParentId } from '/@/api/demo/system';
  import { useUserStore } from '/@/store/modules/user';
  import { useConfigStore } from '/@/store/modules/config';
  import { useDrawer } from '/@/components/Drawer';
  import LxTransferDrawer from '/@/components/LxComponents/LxTransfer/LxTransferDrawer.vue';

  import { getBidSectionPageByQueryDto, getProjectById } from '/@/api/purchase/waitTenderApi';

  export default defineComponent({
    components: {
      BasicTable,
      TableAction,
      LxTransferDrawer,
    },
    setup() {
      // const { createMessage } = useMessage();
      const userStore = useUserStore().getUserInfo;
      // 是否是招标公司用户
      const ifCurrentUserBiddingCompanyUser = computed(() => {
        return userStore.role === 5;
      });
      const configStore = useConfigStore();
      const router = useRouter();
      const [registerDrawer, { openDrawer }] = useDrawer();
      // 组织查询参数
      const {
        resetHqlQueryDto,
        setPageByQueryInfo,
        appendQueryListByQueryInfoValuePlain,
        setSortByQueryInfo,
        getHqlQueryDto,
        appendQueryList,
      } = useHqlQueryDto(pageAndSort());
      // 请求之前对参数进行处理
      const beforeFetch = async (queryInfo: any) => {
        resetHqlQueryDto(); // 先重置
        setPageByQueryInfo(queryInfo);
        // 当前人
        // 是否是招标公司用户
        if (ifCurrentUserBiddingCompanyUser.value) {
          // 招标公司
          appendQueryList({
            param: 'bidSection.biddingCompany.user.id',
            type: 'equal',
            value: [userStore?.id.toString()],
          });
        } else {
          // 组织处理人
          appendQueryList({
            param: 'bidSection.project.BiddingUserId',
            type: 'equal',
            value: [userStore?.id.toString()],
          });
        }
        appendQueryListByQueryInfoValuePlain('bidSection.proName', 'like', queryInfo.proName);
        appendQueryListByQueryInfoValuePlain('bidSection.proNumber', 'like', queryInfo.proNumber);
        appendQueryListByQueryInfoValuePlain(
          'bidSection.project.projectType.id',
          'equal',
          queryInfo.projectTypeId,
        );
        // 发布日期
        if (queryInfo.releaseDate) {
          appendQueryListByQueryInfoValuePlain(
            'bidSection.project.releaseDate',
            'ge',
            `${queryInfo.releaseDate[0]} 00:00:00`,
          );
          appendQueryListByQueryInfoValuePlain(
            'bidSection.project.releaseDate',
            'le',
            `${queryInfo.releaseDate[1]} 23:59:59`,
          );
        }
        setSortByQueryInfo(queryInfo, 'bidSection');
        const queryDto = getHqlQueryDto();
        return queryDto;
      };

      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        return data.map((item) => item.bidSection);
      };
      const [registerTable, { reload }] = useTable({
        title: '待招标列表',
        api: getBidSectionPageByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        rowKey: 'id',
        useSearchForm: true,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema(),
        },
        showTableSetting: true, // 显示表格设置工具
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
          // 表格右侧操作列配置 BasicColumn
          width: 100,
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          slots: {
            customRender: 'action',
          },
        },
      });

      // 查看报价供应商 跳转标段表
      const handleEditor = async (record?: any) => {
        router.push({
          path: '/reportForm/reportProjectBidsection',
          query: {
            bidSectionId: record.id,
          },
        });
      };

      const fun = async () => {
        console.log(configStore.GET_CONFIG_DICTIONRY);
        await getDictionaryByParentId(configStore.GET_CONFIG_DICTIONRY.userRoleId);
      };
      // 转交项目
      const handleTransfer = (record?: any) => {
        console.log(record, 'record');
        openDrawer(true, {
          objectId: record.project.id,
          biddingDepartmentId: record.project.biddingDepartmentId,
        });
      };
      function handleSuccess() {
        reload(); // 刷新表格
      }
      return {
        fun,
        registerTable,
        handleEditor,
        handleSuccess,
        registerDrawer,
        handleTransfer,
        userStore,
      };
    },
  });
</script>
