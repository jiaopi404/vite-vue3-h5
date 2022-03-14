<template>
  <div style="padding: 16px">
    <Card>
      <BasicTable @register="registerTable">
        <template #registrationInstructions1="{ record }">
          <block v-show="!record.invalidQuotation">
            <Tag
              v-if="calcReviewInfo(record, 1)"
              color="gray"
              style="cursor: pointer"
              @click="setResult(record, 1)"
            >
              确定
            </Tag>
            <Tag v-else color="blue" style="cursor: pointer" @click="setResult(record, 1)">
              确定
            </Tag>
          </block>
        </template>
        <template #registrationInstructions2="{ record }">
          <block v-show="!record.invalidQuotation">
            <Tag
              v-if="calcReviewInfo(record, 2)"
              color="gray"
              style="cursor: pointer"
              @click="setResult(record, 2)"
            >
              确定
            </Tag>
            <Tag v-else color="blue" style="cursor: pointer" @click="setResult(record, 2)">
              确定
            </Tag>
          </block>
        </template>
        <template #registrationInstructions3="{ record }">
          <block v-show="!record.invalidQuotation">
            <Tag
              v-if="calcReviewInfo(record, 3)"
              color="gray"
              style="cursor: pointer"
              @click="setResult(record, 3)"
            >
              确定
            </Tag>
            <Tag v-else color="blue" style="cursor: pointer" @click="setResult(record, 3)">
              确定
            </Tag>
          </block>
        </template>
        <template #action="{ record }">
          <TableAction
            :actions="[
              {
                label: '报价清单附件',
                onClick: attRListAttachment.bind(null, record),
                ifShow: () => {
                  return configStore?.GET_CONFIG_MODULE?.supplierQuotationFileRequired
                    ? true
                    : false;
                },
              },
              {
                label: '查看报价详情',
                onClick: handelSee.bind(null, record),
              },
            ]"
          />
        </template>
      </BasicTable>
    </Card>
    <Card title="评审意见" style="margin-top: 20px">
      <BasicForm @register="registerForm" />
      <div style="text-align: center">
        <Button type="primary" @click="handelSava" :loading="loading">提交评审</Button>
      </div>
    </Card>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref, unref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useRouter } from 'vue-router';
  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { router, resetRouter } from '/@/router';
  // 按需引入
  import { Popconfirm, Card, Input, Tag, Button } from 'ant-design-vue';
  // 配置数据
  import { columns, formSchema } from './reviewQuotation.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { useConfigStore } from '/@/store/modules/config';
  import {
    getsupplierQuotationPageByQueryDto,
    saveProEvaluationRecord,
  } from '/@/api/projectReview/projectReviewApi';
  import { previewFile } from '/@/utils/commonServe/businessUtil';
  import { removeItemFromArr } from '/@/utils/commonServe';

  interface ReviewInfoI {
    bidCompanyId: number;
    successfulSupplier: number;
    result: 1 | 2 | 3 | null;
    mobile: string;
  }

  export default defineComponent({
    name: 'reviewQuotation',
    components: {
      BasicTable,
      Popconfirm,
      TableAction,
      Card,
      Textarea: Input.TextArea,
      Tag,
      Button,
      BasicForm,
    },
    setup() {
      let route = useRoute();
      const router = useRouter();
      const loading = ref(false);
      let ids = Number(route.query.id);
      let extractId = Number(route.query.peId);
      const userInfo = useUserStore().getUserInfo;
      const reviewInfo = ref<ReviewInfoI[]>([]);
      const configStore = useConfigStore();
      const { createMessage } = useMessage();
      const { closeCurrent } = useTabs(router);
      const [registerDrawer, { openDrawer }] = useDrawer();
      const [registerForm, { validate }] = useForm({
        labelWidth: 100,
        schemas: formSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });
      // 组织查询参数
      const { getHqlQueryDto, resetHqlQueryDto } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          queryList: [
            { param: 'supplierQuotation.ifDelete', type: 'equal', value: [0] },
            { param: 'supplierQuotation.bidSectionId', type: 'equal', value: [ids] },
            { param: 'supplierQuotation.ifCancelQuotation', type: 'equal', value: [0] },
          ],
          dataFieldList: ['supplierQuotation', 'supplierQuotation.id'],
          sorts: [{ dir: 'desc', prop: 'supplierQuotation.id' }],
        },
      });
      // 请求之前对参数进行处理
      const beforeFetch = (queryInfo: any) => {
        resetHqlQueryDto(); // 先重置
        const queryDto = getHqlQueryDto();
        console.log('🚀 ~ file: index.vue ~ line 66 ~ queryDto', queryDto, queryInfo);
        return queryDto;
      };
      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        console.log('afterFetch11', data);
        return data.map((item) => item.supplierQuotation);
      };
      const [registerTable] = useTable({
        title: '评审报价供应商列表',
        api: getsupplierQuotationPageByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        // useSearchForm: true, // 使用搜索表单
        rowKey: 'id',
        showTableSetting: true, // 显示表格设置工具
        pagination: false,
        maxHeight: 260,
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
          width: 200,
          title: '操作',
          dataIndex: 'action',
          slots: {
            customRender: 'action',
          },
          fixed: undefined,
        },
      });
      // 查看报价详情
      function handelSee(record: Recordable) {
        console.log(record, 'recordrecord');
        router.push({
          path: '/project-review/tenderDetails',
          query: {
            bidSectionId: unref(record.bidSection.id),
            registeredSupplierId: unref(record.registeredSupplier.addUser.id),
            idEditable: 0,
          },
        });
      }

      function calcReviewInfo(record, result) {
        const { bidCompanyId } = _getSupplierInfo(record);
        if (reviewInfo.value.length === 0) {
          return false;
        }
        //纵向评审
        const reviewItemSameResult = reviewInfo.value.find(
          (reviewItem) => reviewItem.result === result,
        );
        if (reviewItemSameResult && reviewItemSameResult.bidCompanyId === bidCompanyId) {
          return true;
        }
        // 横向评审
        const reviewItemSameCompanyId = reviewInfo.value.find(
          (reviewItem) => reviewItem.bidCompanyId === bidCompanyId,
        );
        if (reviewItemSameCompanyId?.result === result) {
          return true;
        }
        if (!reviewItemSameResult && !reviewItemSameCompanyId) {
          return false;
        }
        return false;
      }

      function setResult(record, result) {
        console.log('record result: ', record, result);
        const { bidCompanyId, successfulSupplier, mobile } = _getSupplierInfo(record);
        const reviewItemSelected = reviewInfo.value.filter(
          (reviewItem) => reviewItem.result === result || reviewItem.bidCompanyId === bidCompanyId,
        );
        if (reviewItemSelected.length) {
          reviewItemSelected.forEach((item) => {
            removeItemFromArr(reviewInfo.value, item);
          });
          reviewInfo.value.push({
            bidCompanyId,
            successfulSupplier,
            result: result,
            mobile,
          });
          return;
        }
        reviewInfo.value.push({
          bidCompanyId,
          successfulSupplier,
          result: result,
          mobile,
        });
      }

      function _getSupplierInfo(record) {
        return {
          bidCompanyId: record.registeredSupplier.successfulSupplier.id,
          successfulSupplier: record.registeredSupplier.successfulSupplier.name,
          mobile: record.registeredSupplier.mobile,
        };
      }
      // 保存
      async function handelSava() {
        try {
          loading.value = true;
          const values = await validate();
          let _params = {
            bidSectionId: ids,
            reviewInfo: JSON.stringify(reviewInfo.value),
            addUserId: userInfo.id,
            addUserName: userInfo.perName,
            reviewOpinion: values.reviewOpinion,
            extractId: extractId,
          };
          await saveProEvaluationRecord(_params);
          createMessage.success('保存成功');
          closeCurrent();
          // 返回上一页
          router.push({ path: '/project-review/toBeReviewed' });
        } finally {
          loading.value = false;
        }
      }
      // 报价清单附件
      async function attRListAttachment(record: Recordable) {
        console.log(record, 'recordrecord');
        previewFile({
          name: record.registeredSupplier.successfulSupplier.name,
          url: record.filePath,
        });
      }
      return {
        registerTable,
        registerDrawer,
        handelSee,
        reviewInfo,
        configStore,
        registerForm,
        calcReviewInfo,
        setResult,
        handelSava,
        attRListAttachment,
        loading,
      };
    },
  });
</script>
