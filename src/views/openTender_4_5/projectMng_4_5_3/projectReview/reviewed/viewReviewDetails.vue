<template>
  <div style="padding: 16px">
    <Card>
      <BasicTable @register="registerTable">
        <template #action="{ record }">
          <TableAction
            :actions="[
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
    </Card>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { useRoute } from 'vue-router';
  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { BasicForm, useForm } from '/@/components/Form/index';
  // 按需引入
  import { Popconfirm, Card } from 'ant-design-vue';
  // 配置数据
  import { columns, formSchema } from './viewReviewDetails.data';
  import { getOneByBidSectionIdAndExtractId } from '/@/api/projectReview/projectReviewApi';

  export default defineComponent({
    name: 'viewReviewDetails',
    components: {
      BasicTable,
      Popconfirm,
      TableAction,
      Card,
      BasicForm,
    },
    setup() {
      let route = useRoute();
      let ids = Number(route.query.id);
      let extractId = Number(route.query.peId);
      const [registerDrawer, { openDrawer }] = useDrawer();
      const [registerForm, { setFieldsValue }] = useForm({
        labelWidth: 100,
        schemas: formSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });
      // 请求之前对参数进行处理
      const beforeFetch = () => {
        const params = {
          bidSectionId: ids,
          extractId: extractId,
        };
        return params;
      };
      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        console.log(data);
        setFieldsValue({
          reviewOpinion: data.reviewOpinion,
        });
        const reviewInfo = JSON.parse(data.reviewInfo) || [];
        return reviewInfo;
      };
      const [registerTable] = useTable({
        title: '报价供应商列表',
        api: getOneByBidSectionIdAndExtractId,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        // useSearchForm: true, // 使用搜索表单
        rowKey: 'data.id',
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
        fetchSetting: {
          // The field name of the current page passed to the background
          pageField: '',
          // The number field name of each page displayed in the background
          sizeField: 'data',
          // Field name of the form data returned by the interface
          listField: 'data',
          // Total number of tables returned by the interface field name
          totalField: '',
        },
      });
      // 查看标价
      function handelSee(record: Recordable) {
        openDrawer(true, {
          record,
        });
      }
      return {
        registerTable,
        registerDrawer,
        handelSee, // 确认删除
        registerForm,
      };
    },
  });
</script>
