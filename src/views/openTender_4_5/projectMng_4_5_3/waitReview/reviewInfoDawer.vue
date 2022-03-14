<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    title="评审信息"
    width="576px"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
    <div class="save-review-info-btn">
      <AButton
        class="lly"
        type="primary"
        @click="saveReviewInfoForm"
        :loading="loadingBtn"
        style="margin-right: 10px"
        >保存</AButton
      ></div
    >
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="[{ label: `删除`, onClick: clickDelete.bind(null, record) }]" />
      </template>
    </BasicTable>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, toRaw } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { reviewInfoFormSchema, reviewInfoTableColumns } from './waitReview.data';
  import {
    deletesupplierQuotationById,
    getAllSelectByBidSectionId,
    getsupplierQuotationPageByQueryDto,
    savesupplierQuotation,
  } from '/@/api/projectManagement/proMngWaitReviewApi';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';

  export default defineComponent({
    name: 'ReviewInfoDrawer',
    components: { BasicDrawer, BasicForm, BasicTable, TableAction },
    emits: ['success', 'register'],
    props: {
      statusId: {
        type: Number,
      },
    },
    setup(props, { emit }) {
      const id = ref(0);
      let _list = [];
      const [registerForm, { resetFields, updateSchema, validate }] = useForm({
        labelWidth: 120,
        schemas: reviewInfoFormSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });
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
            { dir: 'desc', prop: 'supplierQuotation.updateDateTime' },
            { dir: 'desc', prop: 'supplierQuotation.id' },
          ],
          queryList: [
            // 采购方式 ！= （电子竞价/询价），状态 = 待采购，项目处理人 = 当前登陆人，未删除的项目
            { param: 'supplierQuotation.ifDelete', type: 'equal', value: [0] },
          ],
          ifCustomHql: true,
          dataFieldList: ['supplierQuotation', 'supplierQuotation.id'],
        },
      });
      const [registerTable, { reload }] = useTable({
        title: '评审信息',
        canResize: false,
        // 点击行不选中
        api: getsupplierQuotationPageByQueryDto,
        columns: reviewInfoTableColumns,
        rowKey: 'supplierQuotation_id',
        beforeFetch: (queryInfo: any) => {
          resetHqlQueryDto(); // 先重置
          setPageByQueryInfo(queryInfo);
          appendQueryListByQueryInfoValuePlain(
            'supplierQuotation.bidSectionId',
            'equal',
            bidSectionId.value,
          );
          setSortByQueryInfo(queryInfo);
          return getHqlQueryDto();
        },
        afterFetch: (data) => {
          return data;
        },
        fetchSetting: {
          // The field name of the current page passed to the background
          pageField: 'page',
          // The number field name of each page displayed in the background
          sizeField: 'pageSize',
          // Field name of the form data returned by the interface
          listField: 'page.content',
          // Total number of tables returned by the interface field name
          totalField: 'page.totalElements',
        },
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
      const bidSectionId: any = ref();
      const bidSectionAmount: any = ref();
      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        setDrawerProps({ confirmLoading: false });
        bidSectionId.value = toRaw(data.record).bidSection.id;
        bidSectionAmount.value = toRaw(data.record).bidSection.budgetAmount;
        console.log(toRaw(data.record).bidSection.id);
        await reload();
        if (toRaw(data.record).bidSection.project.currencyType.code === '1') {
          updateSchema({
            field: 'quotedAmount',
            label: '报价金额（元）',
            componentProps: () => ({
              min: 0,
              max: 1000000000,
              placeholder: '请输入报价金额',
              precision: 2,
              onChange: (e: any) => {
                if (e > bidSectionAmount.value) {
                  updateSchema({
                    field: 'score',
                    componentProps: () => ({
                      min: 0,
                      max: 1000,
                      placeholder: '请输入综合得分',
                      disabled: true,
                    }),
                  });
                } else {
                  updateSchema({
                    field: 'score',
                    componentProps: () => ({
                      min: 0,
                      max: 1000,
                      placeholder: '请输入综合得分',
                    }),
                  });
                }
              },
            }),
          });
        } else {
          updateSchema({
            field: 'quotedAmount',
            label: `报价金额（${toRaw(data.record).bidSection.project.currencyType.name}）`,
            componentProps: () => ({
              min: 0,
              max: 1000000000,
              placeholder: '请输入报价金额',
              precision: 2,
              onChange: (e: any) => {
                if (e > bidSectionAmount.value) {
                  updateSchema({
                    field: 'score',
                    componentProps: () => ({
                      min: 0,
                      max: 1000,
                      placeholder: '请输入综合得分',
                      disabled: true,
                    }),
                  });
                } else {
                  updateSchema({
                    field: 'score',
                    componentProps: () => ({
                      min: 0,
                      max: 1000,
                      placeholder: '请输入综合得分',
                    }),
                  });
                }
              },
            }),
          });
        }
        updateSchema({
          field: 'proName',
          componentProps: {
            placeholder: '请选择供应商名称',
            api: getAllSelectByBidSectionId,
            params: toRaw(data.record).bidSection.id,
            labelField: 'name',
            valueField: 'id',
            showSearch: true,
            optionFilterProp: 'label',
            resultFormatter: (data) => {
              console.log('data is', data);
              data.forEach((item) => {
                item.name = item.successfulSupplier.name;
              });
              return data;
            },
          },
        });
      });
      // getDictionaryInfo()

      // async function handleSubmit() {
      //   await Submit();
      //   await resetForm();
      // }
      const { createMessage, createConfirmPromise } = useMessage();
      async function Submit() {
        const values = await validate();
        setDrawerProps({ confirmLoading: true });
        createMessage.success('添加成功！');
        emit('success');
        setDrawerProps({ confirmLoading: false });
      }
      // 确认按钮
      async function handleSubmit() {
        try {
          await validate();
          await Submit();
          await closeAndEmit();
        } catch (error) {
          console.log('error', error);
          setDrawerProps({ confirmLoading: false });
        }
      }
      // 关闭抽屉
      function closeAndEmit() {
        closeDrawer();
      }
      // 评审信息保存
      const loadingBtn = ref(false);
      async function saveReviewInfoForm() {
        loadingBtn.value = true;
        try {
          console.log('baojia', bidSectionAmount);
          const result = await validate();
          const params = {
            registeredSupplier: {
              id: result.proName,
            },
            quotedAmount: result.quotedAmount,
            score: result.score,
            description: result.description,
            bidSectionId: bidSectionId.value,
            invalidQuotation: result.quotedAmount > bidSectionAmount.value ? 1 : 0,
            quotedTimes: 1,
          };
          await savesupplierQuotation(params);
          createMessage.success('保存成功！');
          updateSchema({
            field: 'score',
            componentProps: () => ({
              min: 0,
              max: 1000,
              placeholder: '请输入综合得分',
              disabled: true,
            }),
          });
          await resetFields();
          await reload();
        } catch (error) {}
        loadingBtn.value = false;
      }
      const clickDelete = async (record: Recordable) => {
        try {
          const result = await deletesupplierQuotationById(toRaw(record)?.supplierQuotation.id);
          console.log('result', result);
          if (!result.msg) {
            createMessage.success('删除成功！');
            await reload();
          } else {
            createMessage.error(result.msg);
          }
        } catch (error) {}
      };
      return {
        registerDrawer,
        registerForm,
        handleSubmit,
        _list,
        registerTable,
        clickDelete,
        saveReviewInfoForm,
        loadingBtn,
      };
    },
  });
</script>
<style lang="less" scoped>
  :deep(.ant-input-number) {
    width: 100% !important;
  }
  .save-review-info-btn {
    width: 100%;
    display: flex;
    justify-content: center;
  }
</style>
