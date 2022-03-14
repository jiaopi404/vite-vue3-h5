<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: `设为待验收`,
              onClick: clickConfirmDeliver.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  import { defineComponent, onMounted, ref, toRaw } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { getBidSectionPage } from '/@/api/projectManagement/proMngWaitReviewApi';
  import { WaitDeliverSearchFormSchema, WaitDeliverTableColumns } from './waitDeliver.data';
  import { saveBidSection } from '/@/api/purchase/plan-purchase';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useConfigStore } from '/@/store/modules/config';
  import { getDictionaryByParentId } from '/@/api/demo/system';
  export default defineComponent({
    components: { BasicTable, TableAction },
    setup() {
      const userInfo = useUserStore().getUserInfo;
      const {
        getHqlQueryDto,
        resetHqlQueryDto,
        setPageByQueryInfo,
        appendQueryListByQueryInfoValuePlain,
        setSortByQueryInfo,
      } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          page: { pageNum: 1, pageSize: 10 },
          sorts: [
            { dir: 'desc', prop: 'bidSection.updateDateTime' },
            { dir: 'desc', prop: 'bidSection.id' },
          ],
          queryList: [
            { param: 'bidSection.ifDelete', type: 'equal', value: [0] },
            { param: 'bidWinner.ifDelete', type: 'equal', value: [0] },
            { param: 'bidSection.status.code', type: 'equal', value: [23] }, // 待交付
            { param: 'bidSection.project.BiddingUserId', type: 'equal', value: [userInfo.id] },
          ],
          dataFieldList: ['bidSection', 'bidSection.id'],
        },
      });
      const [registerTable, { reload }] = useTable({
        ...DEFAULT_TABLE_SETTING_GETTER('待交付列表', 100),
        // api: getBidSectionPage,
        api: getBidSectionPage,
        columns: WaitDeliverTableColumns(),
        rowKey: 'bidSection_id',
        beforeFetch: (queryInfo: any) => {
          resetHqlQueryDto(); // 先重置
          setPageByQueryInfo(queryInfo);
          appendQueryListByQueryInfoValuePlain('bidSection.proName', 'like', queryInfo.proName);
          appendQueryListByQueryInfoValuePlain('bidSection.proNumber', 'like', queryInfo.proNumber);
          appendQueryListByQueryInfoValuePlain(
            'bidSection.project.projectType.id',
            'equal',
            queryInfo.purchaseType,
          );
          appendQueryListByQueryInfoValuePlain(
            'bidSection.procurementMethod.id',
            'equal',
            queryInfo.purchaseMethod,
          );
          setSortByQueryInfo(queryInfo);
          return getHqlQueryDto();
        },
        afterFetch: (data) => {
          return data;
        },
        formConfig: {
          labelWidth: 120,
          schemas: WaitDeliverSearchFormSchema(),
          // placeHolder: '请输入菜单名称',
          autoSubmitOnEnter: true,
        },
        useSearchForm: true,
      });
      const status = ref();
      const configStore = useConfigStore();
      onMounted(async () => {
        const statusList = await getDictionaryByParentId(
          configStore.GET_CONFIG_DICTIONRY.projectStatusId,
        );
        statusList.forEach((item: any) => {
          if (item.code === '24') {
            status.value = item.id;
          }
        });
      });
      const { createMessage, createConfirmPromise } = useMessage();
      async function clickConfirmDeliver(record: Recordable) {
        try {
          console.log('待交付', record);
          await createConfirmPromise({
            content: '确认设为待验收吗？',
          });
          const values = {
            id: toRaw(record).bidSection.id,
            status: {
              id: status.value,
            },
            ifSetToBeAccepted: 1,
          };
          await saveBidSection(values);
          await reload();
          createMessage.success('设为待验收成功！');
        } catch (error) {
          console.log('error is', error);
        }
      }
      return {
        registerTable,
        clickConfirmDeliver,
      };
    },
  });
</script>
