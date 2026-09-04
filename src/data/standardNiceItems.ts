import { NiceClassificationItem } from './niceClassificationData';
import { STANDARD_NICE_ITEMS_PART1 } from './standardNiceItemsPart1';
import { STANDARD_NICE_ITEMS_PART2 } from './standardNiceItemsPart2';
import { STANDARD_NICE_ITEMS_PART3 } from './standardNiceItemsPart3';

// 汇聚全部45类、涵盖sbfl.cn官方标准全部分类群组与代表性商品/服务项目的标准全量数据集
export const ALL_STANDARD_NICE_ITEMS: NiceClassificationItem[] = [
  ...STANDARD_NICE_ITEMS_PART1,
  ...STANDARD_NICE_ITEMS_PART2,
  ...STANDARD_NICE_ITEMS_PART3
].sort((a, b) => {
  if (a.classNum !== b.classNum) {
    return a.classNum - b.classNum;
  }
  if (a.groupCode !== b.groupCode) {
    return a.groupCode.localeCompare(b.groupCode);
  }
  return a.itemNameCn.localeCompare(b.itemNameCn, 'zh-CN');
});
