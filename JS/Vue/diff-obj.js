const mapping = {
  f1: '字段中文名称映射1',
  f2: '字段中文名称映射2',
  f3: '字段中文名称映射3',
  f4: '字段中文名称映射4',
  f5: '字段中文名称映射5',
  f6: '字段中文名称映射6',
  f7: '字段中文名称映射7',
  f8: '字段中文名称映射8',
};

// 原数据
const objTarget = {
  f1: '1',
  f2: false,
  f3: [{ id: 1, name: 'PPS场站1' }],
  f4: 1,
  f5: { id: 'VCAE', name: '组织编码1' },
  f6: '',
  f7: null,
  f8: undefined,
};

// 新数据
const objSource = {
  f3: [
    { id: 3, name: 'PPS场站3' },
    { id: 4, name: 'PPS场站4' },
  ],
  f5: { id: 'IIES', name: '组织编码2' },
  f2: true,
  f1: '2',
  f4: 1,
  f6: '有值',
  f7: 1,
  f8: '123',
};

const help_isBaseType = value => ['string', 'number', 'boolean', 'undefined'].includes(typeof value);
const help_isNullType = value => value === null;
const help_isObjectType = value => ['object'].includes(typeof value);
const help_isArrayType = value => Array.isArray(value);

const REFFIELDVALUE = 'id'; // 引用类型指定判断标识符 唯一
const REFFIELDLABEL = 'name'; // 引用类型指定判断标识符 唯一

const diff_object = (objTarget, objSource) => {
  let diffField = {};
  for (let [key, value] of Object.entries(objTarget)) {
    const sourceValue = objSource[key];
    if (help_isBaseType(value) || help_isNullType(value)) {
      if (value !== sourceValue) {
        diffField[key] = [value, sourceValue]; // 每个不同字段由数组构成 0：老值 1：新值
      }
    } else {
      if (help_isArrayType(value)) {
        const isChangeArray = diff_array(value, sourceValue);
        if (isChangeArray) {
          diffField[key] = isChangeArray;
        }
      } else if (help_isObjectType(value)) {
        if (value[REFFIELDVALUE] !== sourceValue[REFFIELDVALUE]) {
          diffField[key] = [value[REFFIELDLABEL], sourceValue[REFFIELDLABEL]];
        }
      }
    }
  }
  return diffField;
};

const diff_array = (arrTarget, arrSource) => {
  const targetLen = arrTarget.length,
    sourceLen = arrSource.length,
    targetFinal = arrTarget.map(el => el[REFFIELDLABEL]).join('-'),
    sourceFinal = arrSource.map(el => el[REFFIELDLABEL]).join('-');
  if (targetLen !== sourceLen) {
    return [targetFinal, sourceFinal];
  } else {
    const targetOnlyField = arrTarget.map(el => el[REFFIELDVALUE]);
    const sourceOnlyField = arrSource.map(el => el[REFFIELDVALUE]);
    let onOff = false;
    targetOnlyField.forEach(el => {
      if (!sourceOnlyField.includes(el)) {
        onOff = true;
        return;
      }
    });
    if (onOff) {
      return [targetFinal, sourceFinal];
    } else {
      return false;
    }
  }
};

const constructChange = diff => {
  if (Object.keys(diff).length === 0) return false;
  let submitArr = [];
  for (let [key, value] of Object.entries(diff)) {
    let obj = {};
    obj['field'] = key;
    obj['fieldName'] = mapping[key];
    obj['oldValue'] = value[0];
    obj['newValue'] = value[1];
    submitArr.push(obj);
  }
  return submitArr;
};

console.log(constructChange(diff_object(objTarget, objSource)));
