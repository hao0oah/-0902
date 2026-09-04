import { NiceClassificationItem } from './niceClassificationData';
import { FULL_STANDARD_NICE_CLASSES_META } from './fullNiceClassificationMeta';
import { ALL_STANDARD_NICE_ITEMS } from './standardNiceItems';

// 将全量45类每个群组的官方标准结构全部铺开，自动生成覆盖 sbfl.cn 全部45类、全部群组及代表性商品/服务的标准数据
function buildCompleteStandardNiceItems(): NiceClassificationItem[] {
  const existingMap = new Map<string, NiceClassificationItem>();
  
  // 1. 先载入全量商品与服务项 (包含01-45类所有精细商品与服务)
  ALL_STANDARD_NICE_ITEMS.forEach(item => {
    const key = `${item.classNum}-${item.groupCode}-${item.itemNameCn}`;
    existingMap.set(key, item);
  });

  // 2. 遍历45类元数据中的每一个群组，确保每一个群组都至少有一条标准商品/服务记录，且完全覆盖标准结构
  FULL_STANDARD_NICE_CLASSES_META.forEach(cls => {
    cls.defaultGroups.forEach(grp => {
      // 检查当前群组是否已有条目
      const hasItem = Array.from(existingMap.values()).some(
        it => it.classNum === cls.classNum && it.groupCode === grp.code
      );

      if (!hasItem) {
        // 若该群组在预置列表中尚无细项，按群组官方中文名称添加标准分类项
        // 例如群组名称："工业用气体，单质" -> 商品名称取主项
        const primaryName = grp.name.split('，')[0].split('、')[0];
        const item: NiceClassificationItem = {
          id: `sbfl-std-${grp.code}-01`,
          classNum: cls.classNum,
          classTitle: cls.classTitle,
          categoryType: cls.categoryType,
          groupCode: grp.code,
          groupName: grp.name,
          itemNameCn: grp.name,
          itemNameEn: '',
          itemCode: `${grp.code}01`,
          isCore: false,
          importance: 'STANDARD',
          status: 'ACTIVE'
        };
        existingMap.set(`${cls.classNum}-${grp.code}-${item.itemNameCn}`, item);
      }
    });
  });

  return Array.from(existingMap.values()).sort((a, b) => {
    if (a.classNum !== b.classNum) {
      return a.classNum - b.classNum;
    }
    if (a.groupCode !== b.groupCode) {
      return a.groupCode.localeCompare(b.groupCode);
    }
    return a.itemNameCn.localeCompare(b.itemNameCn, 'zh-CN');
  });
}

export const COMPLETE_STANDARD_NICE_ITEMS: NiceClassificationItem[] = buildCompleteStandardNiceItems();
