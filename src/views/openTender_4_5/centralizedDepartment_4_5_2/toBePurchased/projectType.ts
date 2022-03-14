export function projectType(key) {
  let type = '';
  switch (key) {
    case '1':
      type = '采购计划待提交';
      break;

    case '2':
      type = '采购计划审核中';
      break;

    case '3':
      type = '采购计划待处理';
      break;

    case '4':
      type = '立项管理待立项';
      break;

    case '5':
      type = '立项管理审核中';
      break;

    case '6':
      type = '意向公开待提交';
      break;

    case '7':
      type = '意向公开审核中';
      break;

    case '8':
      type = '采购申报待申报';
      break;

    case '9':
      type = '采购申报审核中';
      break;

    case '10':
      type = '待接收';
      break;
    case '11':
      type = '采购申报待处理';
      break;
    case '12':
      type = '待论证';
      break;
    case '13':
      type = '组织内部待审核';
      break;
    case '14':
      type = '组织内部审核中';
      break;
    case '15':
      type = '待采购';
      break;
    case '16':
      type = '待上传采购文件';
      break;
    case '17':
      type = '采购文件审核中';
      break;
    case '18':
      type = '待招标/采购中';
      break;
    case '19':
      type = '待评审';
      break;
    case '20':
      type = '待成交';
      break;
    case '21':
      type = '待确认';
      break;
    case '22':
      type = '待签定';
      break;
    case '23':
      type = '待交付';
      break;
    case '24':
      type = '待验收';
      break;

    default:
      type = '已完成';
      break;
  }
  return type;
}
