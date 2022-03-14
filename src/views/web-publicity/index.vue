<template>
  <div :class="prefixCls">
    <header class="w-1/1 fixed top-0px h-50px z-999 bg-gray-300 bg-opacity-50">
      <div class="container mx-auto w-1200px h-1/1 flex justify-between">
        <!-- logo -->
        <div class="flex items-center"
          ><img
            class="w-40px inline-block"
            src="/resource/img/logo2.png"
            alt=""
            draggable="false"
          />
          <span class="pl-10px text-xl font-semibold text-gray-500">高校电子竞价平台</span></div
        >
        <div class="flex">
          <div
            class="flex items-center cursor-pointer hover:bg-gray-300 text-white px-5px"
            @click="backHome"
          >
            <Icon icon="ant-design:home-outlined" :size="30" style="color: gray" />
          </div>
          <!-- login -->
          <div class="flex px-5px cursor-pointer hover:bg-gray-300">
            <div class="flex items-center" v-if="token">
              <img class="w-30px mr-10px rounded-1/2" :src="getUserInfo.avatar" />
              <span>
                <span class="truncate" v-if="getUserInfo.department">
                  <span :title="getUserInfo.department">{{ getUserInfo.department }}</span>
                  <span :title="getUserInfo.realName">{{ getUserInfo.realName }}</span>
                </span>
                <span class="truncate" v-else>
                  <span :title="getUserInfo.realName">{{ getUserInfo.realName }}</span>
                </span>
              </span>
            </div>
            <div v-else class="flex items-center text-white" style="color: gray" @click="login">
              <Icon icon="ant-design:user-outlined" :size="30" />
              <span class="ml-5px">登录</span>
            </div>
          </div>
        </div>
      </div>
    </header>
    <div class="container mx-auto mt-50px w-1200px">
      <Carousel dot-position="top" autoplay>
        <img class="align-middle" src="/resource/img/lunbo01.jpg" alt="" />
        <img class="align-middle" src="/resource/img/lunbo02.jpg" alt="" />
        <img class="align-middle" src="/resource/img/lunbo03.jpg" alt="" />
      </Carousel>
    </div>
    <section class="relative h-320px bg-gray-50" :class="prefixCls">
      <div
        class="
          container
          absolute
          flex
          items-center
          justify-around
          w-1200px
          mx-auto
          h-80px
          bg-gray-50
          -inset-x-0
          -top-30px
        "
      >
        <div>
          <div>
            <span class="text-5xl font-semibold text-blue-500">{{ total.sqlWinningCount }}</span>
            <span>个</span>
          </div>
          <div>已中标项目</div>
        </div>
        <div>
          <div>
            <span class="text-5xl font-semibold text-blue-500">{{ total.sqlOfferCount }}</span>
            <span>个</span>
          </div>
          <div>可报价项目</div>
        </div>
        <div>
          <div>
            <span class="text-5xl font-semibold text-blue-500">{{ total.sqlSupplierCount }}</span>
            <span>个</span>
          </div>
          <div>注册供应商</div>
        </div>
        <div>
          <div>
            <span class="text-5xl font-semibold text-blue-500">{{ total.todayNoticeCount }}</span>
            <span>个</span>
          </div>
          <div>今日更新公告</div>
        </div>
      </div>
      <!-- 通知公告 & 常用下载 -->
      <div
        class="
          container
          mx-auto
          w-1200px
          absolute
          flex
          content-center
          justify-between
          bg-white
          -inset-x-0
          bottom-15px
        "
      >
        <div class="w-45/100">
          <NoticeAnnouncementCard></NoticeAnnouncementCard>
        </div>
        <div class="w-1px my-20px bg-gray-300"></div>
        <div class="w-45/100">
          <CommonDownloadCard></CommonDownloadCard>
        </div>
      </div>
    </section>

    <main class="container w-1200px mx-auto mt-20px">
      <Tabs v-model:activeKey="activeKey" @change="TabPaneChange" :tabBarGutter="0">
        <TabPane :key="1" tab="采购公告">
          <!-- 搜索组件 -->
          <Search @success="handleSuccess" ref="refPurchaseSearch" :msgType="1"></Search>
          <!-- 卡片盒子 弹性盒 min-h-170px h-510px-->
          <div class="h-510px overflow-y-auto">
            <div
              class="flex flex-wrap content-start justify-between"
              v-if="purchaseData.length > 0"
            >
              <PurchaseCard
                v-for="item in purchaseData"
                :key="item.id"
                :object="item"
                :class="`${prefixCls}-card`"
              ></PurchaseCard>
            </div>
            <div class="mt-200px" v-else>
              <Empty :image="simpleImage" description="暂无数据" />
            </div>
          </div>
          <!-- :imageStyle="{ width: '200px', height: '500px' }" -->
        </TabPane>

        <TabPane :key="0" tab="结果公告">
          <Search @success="handleSuccess" ref="refResultsSearch" :msgType="0"></Search>
          <div class="h-510px overflow-y-auto">
            <div class="flex flex-wrap content-start justify-between" v-if="resultsData.length > 0">
              <ResultsCard
                v-for="item in resultsData"
                :key="item.bidSection.id"
                :object="item"
                :class="`${prefixCls}-card`"
              ></ResultsCard>
            </div>
            <div class="mt-200px" v-else>
              <Empty :image="simpleImage" description="暂无数据" />
            </div>
          </div>
        </TabPane>
      </Tabs>
      <div class="pt-20px pb-10px border-t-2 border-gray-300">
        <Pagination
          class="container flex justify-center mx-auto"
          v-model:current="paginationCurrent"
          :total="paginationTotal"
          :defaultPageSize="6"
          @change="paginationChange"
        />
      </div>
    </main>

    <!-- 页脚 -->
    <footer>
      <div class="text-base" style="background-color: #f6f6f6">
        <div class="container mx-auto w-1200px h-200px p-20px flex">
          <div class="w-300px text-right pr-30px text-black">相关链接</div>
          <div
            class="
              demo
              flex-grow
              px-30px
              py-10px
              flex flex-col flex-wrap
              border-l-2px border-gray-500
            "
          >
            <h6><a href="http://czt.shaanxi.gov.cn/" target="_blank">陕西省财政厅</a></h6>
            <h6><a href="http://www.mof.gov.cn/index.htm">财政部</a></h6>
            <h6><a href="http://jyt.shaanxi.gov.cn/">陕西省教育厅</a></h6>
            <h6><a href="#">陕西省招标采购</a></h6>
            <!-- pmis地址 -->
            <!-- http://localhost:3101/#/supplier/completeListing?bidSectionId=260&projectId=477&bidWinningAmount=111 -->
          </div>
        </div>
      </div>
      <div class="text-center text-gray-200 bg-gray-900 h-50px leading-50px">
        @版权所有：陕西联兴网络科技有限公司&nbsp;&nbsp;&nbsp;&nbsp;技术支持：400 672 -2712 029-
        85201402
      </div>
    </footer>
    <IndexReportFormDialog @register="register" />
    <LxAuditRecord></LxAuditRecord>
  </div>
</template>

<script lang="ts">
  import { Icon } from '/@/components/Icon/index';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { defineComponent, ref, unref, reactive, onMounted, computed } from 'vue';
  // 按需引入
  import { Carousel, Divider, Pagination, Tabs, TabPane, Row, Col, Empty } from 'ant-design-vue';
  import { useRoute, useRouter } from 'vue-router';

  import { purchasePageAndSort, resultsPageAndSort } from './webPublicity.data';
  import NoticeAnnouncementCard from './components/NoticeAnnouncementCard.vue'; // 通知公告
  import CommonDownloadCard from './components/CommonDownloadCard.vue'; // 常用下载
  import Search from './components/Search.vue'; // 搜索组件
  import PurchaseCard from './components/PurchaseCard.vue'; // 采购公告Card
  import ResultsCard from './components/ResultsCard.vue'; // 结果公告Card
  import IndexReportFormDialog from '../sys/index/components/reportFormDialogs/IndexReportFormDialog.vue';

  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { HqlQueryDtoI } from '/#/business';
  import { dateUtil } from '/@/utils/dateUtil';
  import { useUserStore } from '/@/store/modules/user';
  import headerImg from '/@/assets/images/header.jpg';

  // api
  import {
    getBidSectionStatistics,
    getBidSectionPageByQueryDtoNew,
  } from '/@/api/web-publicity/webPublicityApi';
  import { useModal } from '/@/components/Modal';
  import { useToIndexReportDialogEventBusHandler } from '../sys/index/components/indexHelper';
  import { getUserById } from '/@/api/libraryManager/libExpert';
  import LxAuditRecord from '/@/components/LxComponents/LxAuditRecord/LxAuditRecord.vue';

  export default defineComponent({
    components: {
      Icon,
      Row,
      Col,
      Tabs,
      TabPane,
      Empty,
      Carousel, // 轮播图
      Divider, // 分割线
      Pagination, // 分页
      NoticeAnnouncementCard,
      CommonDownloadCard,
      Search,
      PurchaseCard,
      ResultsCard,
      IndexReportFormDialog, // 报表弹框
      LxAuditRecord, // 审核记录
    },
    setup() {
      const route = useRoute();
      const router = useRouter();
      const userStore = useUserStore();
      const token = userStore.getToken; // 判断是否登录
      console.log('判断是否登录:', token);
      const { prefixCls } = useDesign('web-publicity-index');
      const activeKey = ref(1);

      console.log('背景色prefixCls:', prefixCls);

      const paginationCurrent = ref<number>(1); // 分页 当前页数
      const paginationTotal = ref<number>(0); // 分页 总数

      const getUserInfo = computed(() => {
        const { perName = '', department, pic, desc } = userStore.getUserInfo || {};
        if (department) {
          const { name = '' } = department;
          return {
            realName: perName,
            department: name,
            avatar: pic || headerImg,
            desc,
          };
        } else {
          return {
            realName: perName,
            avatar: pic || headerImg,
            desc,
          };
        }
      });

      const [register, { openModal }] = useModal();

      useToIndexReportDialogEventBusHandler((payload) => {
        openModal(true, payload);
      });
      // 登陆
      const login = () => {
        router.push({
          path: '/login',
        });
      };
      //  返回首页
      const backHome = () => {
        router.push({
          path: '/login?redirect=/index',
        });
      };

      let purchaseData = ref([]); // 采购公告 数据
      let resultsData = ref([]); // 结果公告 数据
      let total = reactive({
        sqlWinningCount: 0, // 已中标项目
        sqlOfferCount: 0, // 可报价项目
        sqlSupplierCount: 0, // 注册供应商
        todayNoticeCount: 0, // 今日更新公告
      });

      // 1.获取统计数据
      const getTotalData = async () => {
        const resData = await getBidSectionStatistics({});
        resData.forEach((item) => {
          switch (item.name) {
            case 'sqlWinningCount':
              total.sqlWinningCount = item.count;
              break;
            case 'sqlOfferCount':
              total.sqlOfferCount = item.count;
              break;
            case 'sqlSupplierCount':
              total.sqlSupplierCount = item.count;
              break;
            case 'todayNoticeCount':
              total.todayNoticeCount = item.count;
              break;
            default:
              break;
          }
        });
      };
      // 2.获取 采购公告数据
      const getPurchaseData = async (pageAndSort) => {
        const resData = await getBidSectionPageByQueryDtoNew(pageAndSort);
        purchaseData.value = resData.page.content.map((item) => item.bidSection);
        paginationTotal.value = resData.page.totalElements; // 分页 统计
        // console.log('===采购公告：', purchaseData.value);
      };
      // 3.获取 结果公告数据
      const getResultsData = async (pageAndSort) => {
        const resData = await getBidSectionPageByQueryDtoNew(pageAndSort);
        // resultsData.value = resData.page.content.map((item) => item.bidSection);
        resultsData.value = resData.page.content;
        paginationTotal.value = resData.page.totalElements; // 分页 统计
        // console.log('===结果公告：', resData);
      };

      // ref操作DOM
      const refPurchaseSearch = ref<Nullable<any>>(null);
      const refResultsSearch = ref<Nullable<any>>(null);

      onMounted(() => {
        getTotalData();
        getPurchaseData(purchasePageAndSort(1));
      });

      const fun = async () => {
        refPurchaseSearch.value?.fun?.();
        refResultsSearch.value?.init?.();
      };

      // tab切换 1 采购公告 0 结果公告
      const TabPaneChange = (activeKey) => {
        console.log('切换面板的回调', activeKey);
        if (unref(activeKey)) {
          refPurchaseSearch.value?.init?.();
          getPurchaseData(purchasePageAndSort(1));
        } else {
          refResultsSearch.value?.init?.();
          getResultsData(resultsPageAndSort(1));
        }
      };

      // 分页变化
      const paginationChange = (pageNumber: number) => {
        console.log('Page: ', pageNumber);
        // 判断 1 采购 0 结果
        if (unref(activeKey)) {
          // 采购
          console.log('采购');
          getPurchaseData(purchasePageAndSort(pageNumber));
        } else {
          // 结果
          console.log('结果');
          getResultsData(resultsPageAndSort(pageNumber));
        }
      };

      // 搜索条件改变时触发 （3个其中任何一个改变都会触发）
      const handleSuccess = async (emitData) => {
        // console.log('emit data：', emitData);

        let queryInfo: HqlQueryDtoI = {
          hqlPageAndSortSumDto: {
            ifCustomHql: undefined,
            sorts: undefined,
            page: undefined,
            queryList: [],
            sumList: undefined,
            dataFieldList: [],
            exportExcelDto: undefined,
          },
        };

        // 判断 1 采购 0 结果
        if (unref(activeKey)) {
          queryInfo = purchasePageAndSort(1);
        } else {
          queryInfo = resultsPageAndSort(1);
        }

        const { resetHqlQueryDto, appendQueryListByQueryInfoValuePlain, getHqlQueryDto } =
          useHqlQueryDto(queryInfo); // 查询都会重置到 第一页

        const _data = (data: any) => {
          resetHqlQueryDto(); // 先重置
          // 采购类型
          if (data.projectTypeId) {
            appendQueryListByQueryInfoValuePlain(
              'project.projectType.id',
              'equal',
              data.projectTypeId,
            );
          }
          if (data.proName) {
            appendQueryListByQueryInfoValuePlain('project.proName', 'like', data.proName);
          }
          // 判断 1 采购 0 结果
          if (unref(activeKey)) {
            // g 》 l 《
            if (data.timeDate === dateUtil().format('YYYY-MM-DD')) {
              appendQueryListByQueryInfoValuePlain(
                'project.quoteStartTime',
                'lt',
                `${data.timeDate} 23:59:59`,
              );
              appendQueryListByQueryInfoValuePlain(
                'project.quoteStartTime',
                'gt',
                `${data.timeDate} 00:00:00`,
              );
            } else {
              appendQueryListByQueryInfoValuePlain('project.quoteStartTime', 'gt', data.timeDate);
            }
          } else {
            if (data.timeDate === dateUtil().format('YYYY-MM-DD')) {
              appendQueryListByQueryInfoValuePlain(
                'bidWinner.bidWinningDate',
                'lt',
                `${data.timeDate} 23:59:59`,
              );
              appendQueryListByQueryInfoValuePlain(
                'bidWinner.bidWinningDate',
                'gt',
                `${data.timeDate} 00:00:00`,
              );
            } else {
              appendQueryListByQueryInfoValuePlain('bidWinner.bidWinningDate', 'gt', data.timeDate);
            }
          }
          const queryDto = getHqlQueryDto();
          return queryDto;
        };
        console.log('处理后的参数', _data(emitData));

        // 判断 1 采购 0 结果
        if (unref(activeKey)) {
          getPurchaseData(_data(emitData));
        } else {
          getResultsData(_data(emitData));
        }
      };

      return {
        prefixCls,
        login,
        backHome,
        getUserInfo,
        token,
        total, // 统计面板数据
        activeKey, // 当前激活 tab 面板的 key
        paginationCurrent, // // 分页 当前页数
        paginationTotal, // 分页 总数

        purchaseData,
        resultsData,
        refPurchaseSearch,
        refResultsSearch,

        TabPaneChange,
        handleSuccess,
        paginationChange,
        register,
        simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      };
    },
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-web-publicity-index';
  // 暗夜模式
  html[data-theme='dark'] {
    .@{prefix-cls} {
      background-color: #293146;
    }
    .@{prefix-cls}-card {
      background: rgba(229, 231, 235);
      // background: rgba(243, 244, 246);
    }
  }
</style>
<style scoped>
  /* 轮播图 */
  .ant-carousel :deep(.slick-slide) {
    text-align: center;
    /* height: 250px; */
    /* line-height: 160px; */
    background: #364d79;
    overflow: hidden;
  }

  .ant-carousel :deep(.slick-slide h3) {
    color: #fff;
  }
  /* 分页器 */
  :deep().ant-pagination-item-active {
    background-color: #0960bd;
  }
  :deep().ant-pagination-item-active a {
    color: #fff;
  }
  /* 分割线 */
  /* :deep(.ant-divider-vertical) {
    height: 160px;
    top: 20px;
  } */

  /* tab标签 导航 */
  :deep().ant-tabs-nav {
    width: 100%;
  }
  /* 单个 tab标签 */
  :deep().ant-tabs-tab {
    width: 50%;
    margin: 0px;
    text-align: center;
    font-size: 18px;
    font-weight: bolder;
    background-color: rgba(243, 244, 246, 1);
  }
  :deep().ant-tabs-tab-active {
    background-color: #fff;
  }
  /* tab下划线 */
  /* .ant-tabs-ink-bar.ant-tabs-ink-bar-animated {
    width: 50%;
  } */

  /* 页脚相关链接 */
  .demo h6 {
    width: 230px;
    padding: 0 50px;
  }
  .demo a {
    color: rgba(107, 114, 128);
  }
  .demo a:hover {
    color: #0960bd;
  }
</style>
