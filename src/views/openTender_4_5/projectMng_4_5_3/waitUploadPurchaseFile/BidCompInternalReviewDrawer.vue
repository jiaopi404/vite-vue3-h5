<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :wrapClassName="prefixCls"
    title="填写招标公司内部评审情况"
    width="800px"
    @ok="handleSubmit"
    @close="closeHandler"
  >
    <BasicTable @register="registerTable">
      <!-- <template #toolbar>
        <a-button type="primary" @click="handleCreate"> 添加账户信息</a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '保存',
              onClick: handleSava.bind(null, record),
            },
          ]"
        />
      </template> -->
    </BasicTable>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  // import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { ref } from 'vue';
  // import { LxBasicUploadTest } from '/@/components/LxComponents';
  import {
    // deleteFileById,
    getBidSectionById,
    // getFileList,
    saveBidSection,
    // saveFile,
  } from '/@/api/purchase/plan-purchase';
  import { useMessage } from '/@/hooks/web/useMessage';
  // import { useUserStore } from '/@/store/modules/user';
  // import { CustomMsgEnum } from '/@/enums/messageEnum';
  // import { useConfigStore } from '/@/store/modules/config';
  import { useTable, BasicTable, TableAction, BasicColumn } from '/@/components/Table';
  import { BidSectionI } from '/#/business';
  import { Moment } from 'moment';
  import { dateUtil, formatToDate } from '/@/utils/dateUtil';

  class AuditError {
    public msg;

    constructor(msg) {
      this.msg = msg;
    }
  }

  interface BidCompReviewItemI {
    key: number;
    no: '一审' | '二审' | '三审';
    auditPersons: string;
    suggestion: string;
    auditDate: Moment;
  }

  const { prefixCls } = useDesign('bid-comp-internal-review-drawer');
  const { createMessage } = useMessage();
  // const userStore = useUserStore();
  // const configStore = useConfigStore();

  const emit = defineEmits(['save-success']);

  // BLOCK: common state
  const bidSectionId = ref<Nullable<number>>(null);
  const bidSectionRef = ref<any>(null);
  const tableDataRef = ref<BidCompReviewItemI[]>([]);

  // 上传 委托协议
  const columns: BasicColumn[] = [
    {
      title: '',
      dataIndex: 'no',
      width: 100,
    },
    {
      title: '审核人',
      dataIndex: 'auditPersons',
      editRow: true,
      editable: true,
      width: 200,
      editComponentProps: {
        placehlder: '请输入审核人',
      },
      editRule: async (text) => {
        if (!text.trim()) {
          return '请完善审核人';
        }
        if (text.length > 50) {
          return '请输入1至50位字符';
        }
        return '';
      },
    },
    {
      title: '审核意见',
      dataIndex: 'suggestion',
      editRow: true,
      editable: true,
      width: 200,
      editComponentProps: {
        placehlder: '请输入审核意见',
      },
      editRule: async (text) => {
        if (!text.trim()) {
          return '请完善审核意见';
        }
        if (text.length > 100) {
          return '请输入1至100位字符';
        }
        return '';
      },
    },
    {
      title: '审核日期',
      dataIndex: 'auditDate',
      edit: true,
      editable: true,
      editComponent: 'DatePicker',
      editComponentProps: {
        valueFormat: 'YYYY-MM-DD',
        format: 'YYYY-MM-DD',
        placehlder: '请完善审核日期',
      },
      editRule: async (_) => {
        if (!_) {
          return '请完善审核日期';
        }
        return '';
      },
      width: 150,
    },
  ];
  const [registerTable, { getDataSource, setTableData }] = useTable({
    immediate: false,
    // title: '招标公司内部评审情况',
    dataSource: [tableDataRef.value],
    // dataSource:[Tabledata],
    columns: columns, // 表单列信息
    bordered: true,
    showIndexColumn: true,
    // rowKey: (record) => record.key,
    ellipsis: true,
    actionColumn: undefined,
    pagination: false,
    canResize: false,
  });

  const initTableData = (bidSection: BidSectionI) => {
    const initData: BidCompReviewItemI[] = [
      { key: 1, no: '一审', auditPersons: '', suggestion: '', auditDate: dateUtil(new Date()) },
      { key: 2, no: '二审', auditPersons: '', suggestion: '', auditDate: dateUtil(new Date()) },
      { key: 3, no: '三审', auditPersons: '', suggestion: '', auditDate: dateUtil(new Date()) },
    ];
    try {
      if (bidSection.bidCompInternalReview) {
        const data = JSON.parse(bidSection.bidCompInternalReview);
        tableDataRef.value = data.map((row) => ({
          ...row,
          auditDate: dateUtil(row.auditDate),
        }));
      } else {
        tableDataRef.value = initData;
      }
    } catch (err) {
      console.log('招标公司评审信息初始化失败');
      tableDataRef.value = initData;
    }
    setTableData(tableDataRef.value);
  };

  // BLOCK: drawer inner
  const [registerDrawer, { closeDrawer, changeOkLoading, changeLoading }] = useDrawerInner(
    async (data) => {
      changeLoading(true);
      try {
        bidSectionId.value = data.id;
        bidSectionRef.value = await getBidSectionById(data.id);
        initTableData(bidSectionRef.value);
      } finally {
        changeLoading(false);
      }
    },
  );

  const handleSubmit = async () => {
    changeOkLoading(true);
    try {
      // await validate();
      const tableData = getDataSource();
      // 验证
      const valid = tableData.reduce((prev, row) => {
        prev.push(row.onValid());
        return prev;
      }, []);
      const validRes = await Promise.all(valid);
      if (!validRes.every(Boolean)) {
        throw new Error('请输入正确内容');
      }
      // 处理数据并保存
      const data = tableData.map((row) => {
        return {
          key: row.key,
          no: row.no,
          auditPersons: row.editValueRefs.auditPersons,
          suggestion: row.editValueRefs.suggestion,
          auditDate: formatToDate(row.editValueRefs.auditDate),
        };
      });
      const auditDateTimeList = data.map((row) => +new Date(row.auditDate));
      if (auditDateTimeList[1] < auditDateTimeList[0]) {
        throw new AuditError('二审的审核日期大于等于一审的审核日期');
      }
      if (auditDateTimeList[2] < auditDateTimeList[1]) {
        throw new AuditError('三审的审核日期大于等于二审的审核日期');
      }
      const bidSectionInfo = {
        id: bidSectionId.value,
        bidCompInternalReview: JSON.stringify(data),
      };
      const res = await saveBidSection(bidSectionInfo);
      createMessage.success('保存成功！');
      emit('save-success', res);
      closeDrawer();
    } catch (err) {
      if (err instanceof AuditError) {
        createMessage.error(err.msg);
      } else {
        console.log('出错了', err);
      }
    } finally {
      changeOkLoading(false);
    }
  };

  const closeHandler = () => {
    bidSectionId.value = null;
    setTableData([]);
  };
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-bid-comp-internal-review-drawer';

  .@{prefix-cls} {
    .lx-editable-cell__action {
      display: none;
    }
    .lx-editable-cell__wrapper > .ant-input,
    .lx-editable-cell__wrapper > .ant-calendar-picker {
      width: 100% !important;
    }
  }
</style>
